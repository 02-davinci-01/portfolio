"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";

/**
 * ProjectModel — A lightweight 3D model-viewer for project cards.
 * Lazy-loads when near viewport, subtle scale on hover.
 * Designed to sit inside the project card aspect-ratio containers.
 */

interface ProjectModelProps {
  src: string;
  alt: string;
  cameraOrbit?: string;
  fieldOfView?: string;
  exposure?: string;
  className?: string;
}

const ProjectModel = memo(function ProjectModel({
  src,
  alt,
  cameraOrbit = "30deg 75deg 105%",
  fieldOfView = "30deg",
  exposure = "1.2",
  className = "",
}: ProjectModelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lazy-load: only mount <model-viewer> when near viewport
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

  // Dynamically import the model-viewer library
  useEffect(() => {
    if (!isNearViewport) return;
    import("@google/model-viewer");
  }, [isNearViewport]);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {isNearViewport ? (
        <model-viewer
          src={src}
          alt={alt}
          loading="lazy"
          reveal="auto"
          camera-controls
          interaction-prompt="none"
          camera-orbit={cameraOrbit}
          field-of-view={fieldOfView}
          exposure={exposure}
          shadow-intensity="0.3"
          environment-image="/environment.hdr"
          tone-mapping="neutral"
          disable-zoom
          disable-pan
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            outline: "none",
            cursor: "grab",
            transition: prefersReducedMotion ? "none" : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: hovered && !prefersReducedMotion ? "scale(1.04)" : "scale(1)",
            contain: "layout style paint",
          }}
        />
      ) : (
        <div
          className="w-full h-full bg-neutral-50/50 animate-pulse"
          aria-label={`Loading ${alt}…`}
        />
      )}
    </div>
  );
});

export default ProjectModel;
