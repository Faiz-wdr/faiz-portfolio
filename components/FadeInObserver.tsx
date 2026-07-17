"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FadeInObserver() {
  const pathname = usePathname();

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Instantly reveal all elements if motion is disabled
      document.querySelectorAll(".fade-in-section").forEach((elem) => {
        elem.classList.add("is-visible");
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const fadeElems = document.querySelectorAll(".fade-in-section");
    fadeElems.forEach((elem) => observer.observe(elem));

    return () => {
      fadeElems.forEach((elem) => observer.unobserve(elem));
    };
  }, [pathname]); // Re-observe elements when route path changes

  return null;
}
