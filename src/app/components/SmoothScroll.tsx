"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/app/lib/gsap";

/**
 * SmoothScroll — Lenis provider synced to GSAP's ticker.
 *
 * - Smooth, inertia-based scrolling normalised across trackpad / mouse / touch
 * - Lenis feeds GSAP's ticker → single rAF loop, everything stays in sync
 * - `anchors: true` enables smooth-scroll for bottom-nav anchor links
 * - `autoRaf: false` — we drive Lenis from GSAP's ticker, not its own rAF
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect reduced-motion preference — skip smooth scroll entirely
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.08, // Smooth but not sluggish — matches "quiet confidence"
      smoothWheel: true,
      autoRaf: false, // We sync with GSAP's ticker instead
    });

    lenisRef.current = lenis;

    // Expose globally so modals / overlays can call stop() / start()
    (window as unknown as Record<string, unknown>).__lenis = lenis;

    // Sync Lenis → ScrollTrigger on every scroll event
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's unified ticker (single rAF)
    const tickerCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as Record<string, unknown>).__lenis;
    };
  }, []);

  return <>{children}</>;
}
