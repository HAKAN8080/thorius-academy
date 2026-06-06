"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";

export function MarketingHeader() {
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/me", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) {
          setIsInstructor(Boolean(data?.user?.isInstructor));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsInstructor(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <Header isInstructor={isInstructor} />;
}
