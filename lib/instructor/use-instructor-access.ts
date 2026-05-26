"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface InstructorAccessState {
  isInstructor: boolean;
  loading: boolean;
}

export function useInstructorAccess(user: User | null): InstructorAccessState {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState<InstructorAccessState>({
    isInstructor: false,
    loading: Boolean(user),
  });

  useEffect(() => {
    if (!user) {
      setState({ isInstructor: false, loading: false });
      return;
    }

    let cancelled = false;

    async function load() {
      const { data: profile } = await supabase
        .from("profiles")
        .select("wp_instructor_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.wp_instructor_id) {
        if (!cancelled) {
          setState({ isInstructor: true, loading: false });
        }
        return;
      }

      if (user.email) {
        const { data: instructor } = await supabase
          .from("instructors")
          .select("wp_user_id")
          .eq("email", user.email)
          .maybeSingle();

        if (!cancelled) {
          setState({
            isInstructor: Boolean(instructor?.wp_user_id),
            loading: false,
          });
        }
        return;
      }

      if (!cancelled) {
        setState({ isInstructor: false, loading: false });
      }
    }

    setState({ isInstructor: false, loading: true });
    void load();

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  return state;
}
