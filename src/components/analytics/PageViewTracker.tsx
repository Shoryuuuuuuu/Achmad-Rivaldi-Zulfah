"use client";

import { trackPageView } from "@/lib/tracking";
import { useEffect } from "react";

interface PageViewTrackerProps {
  path?: string;
}

export function PageViewTracker({ path }: PageViewTrackerProps) {
  useEffect(() => {
    trackPageView(path);
  }, [path]);

  return null;
}
