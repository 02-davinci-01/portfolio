"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface StatueViewerProps {
  hovered?: boolean;
  /** Mobile scroll-driven zoom: 0 = default, 1 = fully zoomed. Overrides `hovered` when > 0. */
  scrollProgress?: number;
}

/**
 * StatueViewer — stone statue with hover-zoom to face + translucent glass dialog.
 * Desktop: hover state controlled via `hovered` prop.
 * Mobile: scroll-driven via `scrollProgress` (0-1). Camera zooms at ~50%, dialog at ~70%.
 */
const StatueViewer = memo(function StatueViewer({
  hovered = false,
  scrollProgress,
}: StatueViewerProps) {
  // Derive effective zoom state: scrollProgress takes precedence when defined
  const isScrollDriven = scrollProgress !== undefined && scrollProgress > 0;
  const effectiveHovered = isScrollDriven ? scrollProgress > 0.35 : hovered;
  const showDialog = isScrollDriven ? scrollProgress > 0.55 : false;
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [faceTarget, setFaceTarget] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delay dialog open so it appears after camera rotation completes (~700ms)
  // On mobile (scroll-driven), dialog opens immediately when scrollProgress > 0.7
  useEffect(() => {
    if (dialogTimerRef.current) {
      clearTimeout(dialogTimerRef.current);
      dialogTimerRef.current = null;
    }
    if (isScrollDriven) {
      // Scroll-driven: instant, no timer
      setDialogOpen(showDialog);
    } else if (effectiveHovered) {
      dialogTimerRef.current = setTimeout(() => setDialogOpen(true), 700);
    } else {
      setDialogOpen(false);
    }
    return () => {
      if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
    };
  }, [effectiveHovered, isScrollDriven, showDialog]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsNearViewport(true); io.disconnect(); }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!isNearViewport) return;
    import("@google/model-viewer");
  }, [isNearViewport]);

  const onModelLoad = useCallback(() => {
    const mv = modelRef.current;
    if (!mv) return;
    try {
      const dims = mv.getDimensions();
      const center = mv.getBoundingBoxCenter();
      const faceY = center.y + dims.y * 0.35;
      setFaceTarget(`${center.x}m ${faceY}m ${center.z}m`);
    } catch {
      setFaceTarget("0m 0.45m 0m");
    }
  }, []);

  const defaultOrbit = "0deg 75deg 105%";
  const defaultTarget = "auto auto auto";
  const defaultFov = "30deg";
  const zoomedOrbit = "10deg 106deg 250%";
  const zoomedFov = "13deg";
  const isZoomed = effectiveHovered && !prefersReducedMotion;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      {/* Pulsing golden halo backdrop — alive, warm */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
        {/* Outer ambient glow — warm gold */}
        <div
          className="absolute rounded-full transition-[width,filter,background] duration-[1400ms] ease-out animate-halo-pulse"
          style={{
            width: effectiveHovered ? "130%" : "95%",
            aspectRatio: "1",
            background: effectiveHovered
              ? "radial-gradient(circle, rgba(200,170,80,0.18) 0%, rgba(200,170,80,0.08) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(200,170,80,0.12) 0%, rgba(200,170,80,0.05) 35%, transparent 65%)",
            filter: effectiveHovered ? "blur(50px)" : "blur(40px)",
          }}
        />
        {/* Core glow — brighter gold */}
        <div
          className="absolute rounded-full transition-[width,filter,background] duration-[1000ms] ease-out animate-halo-pulse-inner"
          style={{
            width: effectiveHovered ? "85%" : "65%",
            aspectRatio: "1",
            background: effectiveHovered
              ? "radial-gradient(circle, rgba(210,180,90,0.22) 0%, rgba(200,170,80,0.10) 30%, transparent 60%)"
              : "radial-gradient(circle, rgba(200,170,80,0.16) 0%, rgba(200,170,80,0.07) 25%, transparent 55%)",
            filter: effectiveHovered ? "blur(35px)" : "blur(25px)",
          }}
        />
        {/* Ground shadow — stays dark for grounding */}
        <div
          className="absolute transition-[width,height,filter,background] duration-[1200ms] ease-out"
          style={{
            bottom: '5%',
            width: effectiveHovered ? '70%' : '55%',
            height: effectiveHovered ? '18%' : '14%',
            borderRadius: '50%',
            background: effectiveHovered
              ? 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.05) 50%, transparent 80%)'
              : 'radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.03) 45%, transparent 75%)',
            filter: effectiveHovered ? 'blur(20px)' : 'blur(15px)',
          }}
        />
        {/* Solid ring — visible on white, pulses gently */}
        <div
          className="absolute rounded-full transition-[width] duration-[1200ms] ease-out animate-halo-pulse"
          style={{
            width: effectiveHovered ? '55%' : '45%',
            aspectRatio: '1',
            border: '1.5px solid rgba(180,160,100,0.25)',
            boxShadow: '0 0 20px 2px rgba(200,170,80,0.08)',
          }}
        />
      </div>

      {/* Terminal dialog — behind the statue, z-index below model-viewer */}
      <AnimatePresence>
        {dialogOpen && (
          <div
            className="absolute"
            style={{
              top: isScrollDriven ? '-5%' : '-1%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="terminal-dialog"
            >
              <div className="terminal-dialog__body">
                <p className="terminal-dialog__line terminal-dialog__line--translatable">
                  <span className="terminal-dialog__original">Opera et facta hic inscripta</span>
                  <span className="terminal-dialog__translation">Works & deeds inscribed here</span>
                </p>

                <div className="terminal-dialog__divider" />

                <button
                  type="button"
                  className="terminal-dialog__link group pointer-events-auto"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = '/resume.pdf';
                    a.download = 'Vedant_Nagwanshi_Resume.pdf';
                    a.click();
                  }}
                >
                  <span className="terminal-dialog__link-text">
                    Resume Granted
                  </span>
                  <span className="terminal-dialog__cursor" />
                  <svg className="terminal-dialog__icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3D model — no camera-controls so pointer doesn't interfere */}
      {isNearViewport ? (
        <model-viewer
          ref={(el: HTMLElement | null) => {
            modelRef.current = el;
            if (el) el.addEventListener("load", onModelLoad);
          }}
          src="/hl._alexius.glb"
          alt="Stone statue of Hl. Alexius"
          loading="lazy"
          reveal="auto"
          interaction-prompt="none"
          camera-orbit={isZoomed ? zoomedOrbit : defaultOrbit}
          camera-target={isZoomed && faceTarget ? faceTarget : defaultTarget}
          field-of-view={isZoomed ? zoomedFov : defaultFov}
          interpolation-decay="200"
          exposure="1.6"
          shadow-intensity="1"
          shadow-softness="0.7"
          environment-image="/environment.hdr"
          tone-mapping="commerce"
          disable-zoom
          disable-pan
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            outline: "none",
            contain: "layout style",
            position: "relative" as const,
            zIndex: 15,
            cursor: "none",
            pointerEvents: "none" as const,
          }}
        >
          <span slot="progress-bar" />
        </model-viewer>
      ) : (
        <div className="w-full h-full bg-neutral-50/50 animate-pulse rounded-lg" aria-label="Loading 3D statue…" />
      )}

    </div>
  );
});

export default StatueViewer;
