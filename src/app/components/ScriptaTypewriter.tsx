"use client";

import { useEffect, useRef, useState, memo } from "react";

/**
 * ScriptaTypewriter — Auto-rotating 3D typewriter with a soft steel halo.
 * The visual anchor for the Scripta (Writings) section — "the written record."
 * Lazy-loads model-viewer when near the viewport; mirrors the reveal + float
 * choreography of the other section models.
 */
const ScriptaTypewriter = memo(function ScriptaTypewriter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
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
      {/* ── Halo glow — cool steel/ink, echoing Scripta's accent ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        {/* Outer soft glow */}
        <div
          className="absolute rounded-full will-change-[filter,transform] animate-halo-pulse"
          style={{
            width: "140%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(61,86,112,0.16) 0%, rgba(43,58,78,0.08) 32%, rgba(43,58,78,0.03) 55%, transparent 80%)",
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
              "radial-gradient(circle, rgba(90,116,146,0.14) 0%, rgba(61,86,112,0.06) 42%, transparent 70%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {/* Floating shadow */}
      <div className="model-shadow" style={{ zIndex: 0 }} />

      {isNearViewport ? (
        <div className={prefersReducedMotion ? "" : "model-float-inner"} style={{ width: "100%", height: "100%" }}>
          <model-viewer
            ref={(el: HTMLElement | null) => {
              modelRef.current = el;
            }}
            src="/portfolio/typewriter.glb"
            alt="3D Typewriter — Scripta section"
            loading="lazy"
            reveal="auto"
            auto-rotate
            auto-rotate-delay="0"
            rotation-per-second="12deg"
            interaction-prompt="none"
            camera-orbit="25deg 78deg 105%"
            field-of-view="30deg"
            exposure="1.15"
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

export default ScriptaTypewriter;
