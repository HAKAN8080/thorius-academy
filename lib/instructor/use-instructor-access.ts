"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getInstructorAccessSummary } from "@/lib/actions/instructor-access";

interface InstructorAccessState {
  isInstructor: boolean;
  hasStudentCourses: boolean;
  loading: boolean;
}

export function useInstructorAccess(user: User | null): InstructorAccessState {
  const [state, setState] = useState<InstructorAccessState>({
    isInstructor: false,
    hasStudentCourses: false,
    loading: Boolean(user),
  });

  useEffect(() => {
    if (!user) {
      setState({ isInstructor: false, hasStudentCourses: false, loading: false });
      return;
    }

    let cancelled = false;
    setState({ isInstructor: false, hasStudentCourses: false, loading: true });

    getInstructorAccessSummary()
      .then((summary) => {
        if (!cancelled) {
          setState({
            isInstructor: summary.isInstructor,
            hasStudentCourses: summary.hasStudentCourses,
            loading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            isInstructor: false,
            hasStudentCourses: false,
            loading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return state;
}
