"use client";

import { useEffect, useRef, useState, memo } from "react";

/**
 * PabulumHelmet — Auto-rotating 3D Daft Punk Thomas helmet with a soft halo.
 * Used in the Animæ Pabulum (Books & Music) section as a visual anchor.
 * Lazy-loads model-viewer when near the viewport.
 */
const PabulumHelmet = memo(function PabulumHelmet() {
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
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* Outer soft glow — dark smoky charcoal */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse"
          style={{
            width: "160%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(30,30,35,0.18) 0%, rgba(40,40,48,0.10) 30%, rgba(50,50,58,0.04) 55%, transparent 75%)",
            filter: "blur(45px)",
          }}
        />
        {/* Inner core — slightly brighter charcoal */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse-inner"
          style={{
            width: "95%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(25,25,30,0.15) 0%, rgba(35,35,42,0.06) 40%, transparent 65%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {isNearViewport ? (
        /* @ts-expect-error model-viewer is a web component with custom attributes */
        <model-viewer
          ref={(el: HTMLElement | null) => {
            modelRef.current = el;
          }}
          src="/portfolio/daft_punk_thomas_helmet.glb"
          alt="3D Daft Punk Thomas Helmet — Books & Music section"
          loading="lazy"
          reveal="auto"
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="15deg"
          interaction-prompt="none"
          camera-orbit="30deg 75deg 105%"
          field-of-view="28deg"
          exposure="0.35"
          shadow-intensity="0.4"
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

export default PabulumHelmet;
