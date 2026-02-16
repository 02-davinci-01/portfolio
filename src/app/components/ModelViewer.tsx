"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";

/**
 * ModelViewer — renders the 3D computer model as a hero visual element.
 * Subtle scale on hover, no overlays.
 */
const ModelViewer = memo(function ModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
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
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Dynamically import the model-viewer library only when needed
  useEffect(() => {
    if (!isNearViewport) return;
    import("@google/model-viewer");
  }, [isNearViewport]);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Gradient halo behind the model */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="absolute rounded-full transition-all duration-700 ease-in-out will-change-[width,filter]"
          style={{
            width: hovered ? "95%" : "85%",
            aspectRatio: "1",
            background:
              "radial-gradient(circle, rgba(220,215,255,0.5) 0%, rgba(200,210,255,0.2) 35%, rgba(240,235,250,0.08) 60%, transparent 80%)",
            filter: "blur(30px)",
          }}
        />
        <div
          className="absolute rounded-full transition-all duration-500 ease-in-out will-change-[width,filter]"
          style={{
            width: hovered ? "65%" : "55%",
            aspectRatio: "1",
            background: hovered
              ? "radial-gradient(circle, rgba(120,130,255,0.18) 0%, rgba(160,170,255,0.06) 50%, transparent 70%)"
              : "radial-gradient(circle, rgba(180,180,210,0.1) 0%, rgba(180,180,210,0.03) 50%, transparent 70%)",
            filter: hovered ? "blur(25px)" : "blur(20px)",
          }}
        />
      </div>

      {isNearViewport ? (
        /* @ts-expect-error model-viewer is a web component with custom attributes */
        <model-viewer
          src="/personal_computer_pbr.glb"
          alt="3D Personal Computer"
          loading="lazy"
          reveal="auto"
          camera-controls={!prefersReducedMotion}
          interaction-prompt="none"
          camera-orbit="75deg 75deg 105%"
          min-camera-orbit="auto auto auto"
          max-camera-orbit="auto auto auto"
          field-of-view="30deg"
          exposure="1.4"
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
            transition: prefersReducedMotion ? "none" : "transform 0.5s ease",
            transform: hovered && !prefersReducedMotion ? "scale(1.03)" : "scale(1)",
            contain: "layout style paint",
          }}
        />
      ) : (
        <div
          className="w-full h-full bg-neutral-50/50 animate-pulse rounded-lg"
          aria-label="Loading 3D model…"
        />
      )}
    </div>
  );
});

export default ModelViewer;
