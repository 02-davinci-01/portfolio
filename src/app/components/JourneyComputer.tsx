"use client";

import { useEffect, useRef, useState, memo } from "react";

/**
 * JourneyComputer — Auto-rotating 3D personal computer with a soft halo.
 * Used in the Iter (Journey) section as a visual anchor.
 * Lazy-loads model-viewer when near the viewport.
 */
const JourneyComputer = memo(function JourneyComputer() {
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
        {/* Outer soft glow — warm amber tint */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse"
          style={{
            width: "140%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(180,140,60,0.18) 0%, rgba(160,120,50,0.09) 30%, rgba(140,100,40,0.03) 55%, transparent 80%)",
            filter: "blur(40px)",
          }}
        />
        {/* Inner brighter core */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse-inner"
          style={{
            width: "85%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(200,160,70,0.15) 0%, rgba(170,130,50,0.06) 40%, transparent 70%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {/* Floating shadow */}
      <div className="model-shadow" style={{ zIndex: 0 }} />

      {isNearViewport ? (
        <div className={prefersReducedMotion ? '' : 'model-float-inner'} style={{ width: '100%', height: '100%' }}>
        <model-viewer
          ref={(el: HTMLElement | null) => {
            modelRef.current = el;
          }}
          src="/personal_computer_pbr.glb"
          alt="3D Personal Computer — Journey section"
          loading="lazy"
          reveal="auto"
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="12deg"
          interaction-prompt="none"
          camera-orbit="30deg 75deg 105%"
          field-of-view="30deg"
          exposure="1.2"
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
        >
          <span slot="progress-bar" />
        </model-viewer>
        </div>
      ) : (
        <div
          className="w-full h-full bg-neutral-50/30 animate-pulse rounded-lg"
          aria-label="Loading 3D model…"
        />
      )}
    </div>
  );
});

export default JourneyComputer;
