"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function isInternalNavigation(href: string, pathname: string): boolean {
  if (!href || href.startsWith("#")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      return false;
    }

    const nextPath = url.pathname.replace(/\/$/, "") || "/";
    const currentPath = pathname.replace(/\/$/, "") || "/";

    return !(nextPath === currentPath && url.search === window.location.search);
  } catch {
    return false;
  }
}

export function NavigationPending() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearPending = () => {
    setPending(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };

  const startPending = (maxMs: number) => {
    setPending(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(clearPending, maxMs);
  };

  useEffect(() => {
    clearPending();
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]");
      if (anchor instanceof HTMLAnchorElement) {
        if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
          return;
        }

        const href = anchor.getAttribute("href");
        if (href && isInternalNavigation(href, pathname)) {
          startPending(45000);
        }
        return;
      }

      const submitControl = target?.closest(
        'button[type="submit"], input[type="submit"]',
      );
      const form = submitControl?.closest("form");
      if (form instanceof HTMLFormElement) {
        if (form.dataset.noPendingCursor === "true") {
          return;
        }
        startPending(15000);
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("navigation-pending", pending);
    document.documentElement.setAttribute(
      "aria-busy",
      pending ? "true" : "false",
    );

    return () => {
      document.documentElement.classList.remove("navigation-pending");
      document.documentElement.removeAttribute("aria-busy");
    };
  }, [pending]);

  return null;
}
