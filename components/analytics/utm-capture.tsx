"use client";

import { useEffect } from "react";
import { captureAttributionFromLocation } from "@/lib/analytics/utm";

/** Persist UTM/gclid/fbclid from the landing URL for checkout attribution. */
export function UtmCapture() {
  useEffect(() => {
    captureAttributionFromLocation();
  }, []);

  return null;
}
