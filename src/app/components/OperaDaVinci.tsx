"use client";

import { useEffect, useRef, useState, memo } from "react";

/**
 * OperaDaVinci — Auto-rotating 3D Leonardo da Vinci bust with a soft halo.
 * Used in the Opera (Works) section as a visual anchor.
 * Lazy-loads model-viewer when near the viewport.
 */
const OperaDaVinci = memo(function OperaDaVinci() {
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
      style={{ width: "100%", height: "400px" }}
    >
      {/* ── Halo glow ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* Outer soft glow — warm marble / stone tint */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse"
          style={{
            width: "150%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(160,145,120,0.20) 0%, rgba(140,125,100,0.10) 30%, rgba(120,110,90,0.04) 55%, transparent 80%)",
            filter: "blur(42px)",
          }}
        />
        {/* Inner brighter core */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse-inner"
          style={{
            width: "90%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(180,165,140,0.15) 0%, rgba(150,135,110,0.06) 40%, transparent 70%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {isNearViewport ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            mask: "radial-gradient(ellipse 55% 60% at 50% 45%, black 40%, transparent 75%)",
            WebkitMask: "radial-gradient(ellipse 55% 60% at 50% 45%, black 40%, transparent 75%)",
          }}
        >
          {/* @ts-expect-error model-viewer is a web component with custom attributes */}
          <model-viewer
            ref={(el: HTMLElement | null) => {
              modelRef.current = el;
            }}
            src="/portfolio/leonardo_davinci_bust.glb"
            alt="3D Leonardo da Vinci Bust — Works section"
            loading="lazy"
            reveal="auto"
            auto-rotate
            auto-rotate-delay="0"
            rotation-per-second="10deg"
            interaction-prompt="none"
            camera-orbit="200deg 75deg 60%"
            camera-target="auto 135% auto"
            field-of-view="14deg"
            exposure="1.0"
            shadow-intensity="0"
            environment-image="neutral"
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

export default OperaDaVinci;
