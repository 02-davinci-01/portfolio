"use client";

import { useEffect, useRef, useState, memo } from "react";

/**
 * NexusDog — Auto-rotating 3D dog model with a soft halo.
 * Used in the Nexus (Connection) section as a visual anchor.
 * Lazy-loads model-viewer when near the viewport.
 */
const NexusDog = memo(function NexusDog() {
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
      style={{ width: "100%", height: "420px" }}
    >
      {/* ── Halo glow ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* Outer soft glow — warm earthy brown tint */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse"
          style={{
            width: "145%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(140,110,70,0.18) 0%, rgba(120,95,55,0.09) 30%, rgba(100,80,45,0.03) 55%, transparent 80%)",
            filter: "blur(40px)",
          }}
        />
        {/* Inner brighter core */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse-inner"
          style={{
            width: "88%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(160,130,85,0.14) 0%, rgba(130,105,65,0.06) 40%, transparent 70%)",
            filter: "blur(26px)",
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
          src="/portfolio/dog.glb"
          alt="3D Dog — Connection section"
          loading="lazy"
          reveal="auto"
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="12deg"
          interaction-prompt="none"
          camera-orbit="20deg 65deg 95%"
          field-of-view="32deg"
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

export default NexusDog;
