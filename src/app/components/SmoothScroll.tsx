"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/app/lib/gsap";

/**
 * SmoothScroll — Lenis provider synced to GSAP's ticker.
 *
 * - Smooth, inertia-based scrolling normalised across trackpad / mouse / touch
 * - Lenis feeds GSAP's ticker → single rAF loop, everything stays in sync
 * - Same-page `#anchor` links glide through Lenis instead of jumping (see
 *   `onAnchorClick`) — on every route, e.g. the Scripta article contents
 * - `autoRaf: false` — we drive Lenis from GSAP's ticker, not its own rAF
 */

/* Expo-out: quick to leave, long soft landing. */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
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

    // Same-page anchor links → smooth Lenis glide. Runs after React's own
    // handlers (document-level, bubble phase), so components that already
    // steer Lenis themselves (e.g. the homepage bottom nav) opt out simply
    // by calling preventDefault(). Honours the target's `scroll-margin-top`
    // so headings land below sticky bars, exactly like a native jump would.
    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, window.location.href);
      const here = window.location;
      if (!url.hash || url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const distance = Math.abs(target.getBoundingClientRect().top - margin);
      lenis.scrollTo(target, {
        offset: -margin,
        // Longer trips take a little longer, but never drag.
        duration: Math.min(1.6, Math.max(0.8, 0.6 + distance / 3000)),
        easing: easeOutExpo,
      });
      if (url.hash !== here.hash) history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as Record<string, unknown>).__lenis;
    };
  }, []);

  return <>{children}</>;
}
