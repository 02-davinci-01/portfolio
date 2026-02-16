"use client";

import { useEffect, useRef, useState, memo } from "react";

/**
 * CraftRedbull — Auto-rotating 3D redbull can grenade with a soft halo.
 * Used in the Artificium (Craft) section as a visual anchor,
 * mirroring JourneyComputer's pattern.
 */
const CraftRedbull = memo(function CraftRedbull() {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Intersection observer — only mount <model-viewer> when nearby
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Dynamically import the model-viewer library only when needed
  useEffect(() => {
    if (!isNearViewport) return;
    import("@google/model-viewer");
  }, [isNearViewport]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ width: "100%", height: "340px" }}
    >
      {/* ── Halo glow ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        {/* Outer soft glow — cool teal tint */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse"
          style={{
            width: "150%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(40,125,145,0.25) 0%, rgba(35,110,130,0.12) 30%, rgba(30,95,115,0.04) 55%, transparent 80%)",
            filter: "blur(40px)",
          }}
        />
        {/* Inner brighter core */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse-inner"
          style={{
            width: "90%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(50,140,160,0.20) 0%, rgba(40,120,140,0.08) 40%, transparent 70%)",
            filter: "blur(26px)",
          }}
        />
      </div>

      {isNearViewport ? (
        /* @ts-expect-error model-viewer is a web component with custom attributes */
        <model-viewer
          ref={(el: HTMLElement | null) => {
            modelRef.current = el;
          }}
          src="/portfolio/redbull_can_grenade_-_flashbang.glb"
          alt="3D Redbull Can Grenade — Craft section"
          loading="lazy"
          reveal="auto"
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="15deg"
          interaction-prompt="none"
          camera-orbit="30deg 70deg 105%"
          field-of-view="28deg"
          exposure="1.1"
          shadow-intensity="0"
          environment-image="/environment.hdr"
          tone-mapping="neutral"
          disable-zoom
          disable-pan
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            outline: "none",
            contain: "layout style paint",
            cursor: "none",
            position: "relative" as const,
            zIndex: 15,
            pointerEvents: "none" as const,
          }}
        />
      ) : (
        <div
          className="w-full h-full bg-neutral-50/30 animate-pulse rounded-lg"
          aria-label="Loading 3D model…"
        />
      )}
    </div>
  );
});

export default CraftRedbull;
