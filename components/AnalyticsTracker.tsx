"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const trackedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Prevent tracking internal admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    if (!trackedPaths.current.has(pathname)) {
      trackedPaths.current.add(pathname);
      trackEvent("Visitor", pathname);
    }
  }, [pathname]);

  return null;
}
