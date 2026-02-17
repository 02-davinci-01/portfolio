"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DostoevskyBustProps {
  hovered?: boolean;
}

/**
 * DostoevskyBust — 3D rock-scan Dostoevsky statue with hover-zoom + quote.
 * Uses the model's native photogrammetry textures; PBR tweaked for a bright
 * stone read on a white background.
 */
const DostoevskyBust = memo(function DostoevskyBust({
  hovered = false,
}: DostoevskyBustProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<any>(null);
  const texturesApplied = useRef(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [faceTarget, setFaceTarget] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

  useEffect(() => {
    if (!isNearViewport) return;
    import("@google/model-viewer");
  }, [isNearViewport]);

  const onModelLoad = useCallback(() => {
    const mv = modelRef.current;
    if (!mv || texturesApplied.current) return;

    // Calculate face target for zoom — this is a full standing figure,
    // so face is near the top of the bounding box
    try {
      const dims = mv.getDimensions();
      const center = mv.getBoundingBoxCenter();
      // Face is ~85% up the total height for a standing statue
      const faceY = center.y + dims.y * 0.32;
      setFaceTarget(`${center.x}m ${faceY}m ${center.z}m`);
    } catch {
      setFaceTarget("0m 1.2m 0m");
    }

    // This model is a photogrammetry rock-scan — it already has baked
    // stone textures. Just refine PBR so it reads as clean stone.
    try {
      const model = mv.model;
      if (!model) return;

      for (const material of model.materials) {
        const pbr = material.pbrMetallicRoughness;
        // Keep native textures, just ensure non-metallic rough stone
        pbr.setMetallicFactor(0.0);
        pbr.setRoughnessFactor(0.75);
        // Brighten the base color slightly so it reads lighter on white bg
        pbr.setBaseColorFactor([1.15, 1.13, 1.10, 1.0]);
      }
      texturesApplied.current = true;
    } catch { /* ignore — model will use its default materials */ }
  }, []);

  // Standing figure: match StatueViewer's camera pattern
  const defaultOrbit = "15deg 78deg 105%";
  const defaultTarget = "auto auto auto";
  const defaultFov = "30deg";
  // Zoom: swing clockwise to face-on, close-up intimate framing
  const zoomedOrbit = "50deg 90deg 170%";
  const zoomedFov = "89deg";
  const isZoomed = hovered && !prefersReducedMotion;
  const dialogOpen = hovered;

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
            width: hovered ? "120%" : "90%",
            aspectRatio: "1",
            background: hovered
              ? "radial-gradient(circle, rgba(200,170,80,0.18) 0%, rgba(200,170,80,0.08) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(200,170,80,0.12) 0%, rgba(200,170,80,0.05) 35%, transparent 65%)",
            filter: hovered ? "blur(50px)" : "blur(40px)",
          }}
        />
        {/* Core glow — brighter gold */}
        <div
          className="absolute rounded-full transition-[width,filter,background] duration-[1000ms] ease-out animate-halo-pulse-inner"
          style={{
            width: hovered ? "75%" : "60%",
            aspectRatio: "1",
            background: hovered
              ? "radial-gradient(circle, rgba(210,180,90,0.22) 0%, rgba(200,170,80,0.10) 30%, transparent 60%)"
              : "radial-gradient(circle, rgba(200,170,80,0.16) 0%, rgba(200,170,80,0.07) 25%, transparent 55%)",
            filter: hovered ? "blur(35px)" : "blur(25px)",
          }}
        />
        {/* Ground shadow — stays dark for grounding */}
        <div
          className="absolute transition-[width,height,filter,background] duration-[1200ms] ease-out"
          style={{
            bottom: '8%',
            width: hovered ? '65%' : '50%',
            height: hovered ? '16%' : '12%',
            borderRadius: '50%',
            background: hovered
              ? 'radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.05) 50%, transparent 80%)'
              : 'radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.03) 45%, transparent 75%)',
            filter: hovered ? 'blur(20px)' : 'blur(15px)',
          }}
        />
        {/* Solid ring — visible on white, pulses gently */}
        <div
          className="absolute rounded-full transition-[width] duration-[1200ms] ease-out animate-halo-pulse"
          style={{
            width: hovered ? '50%' : '40%',
            aspectRatio: '1',
            border: '1.5px solid rgba(180,160,100,0.25)',
            boxShadow: '0 0 20px 2px rgba(200,170,80,0.08)',
          }}
        />
      </div>

      {/* Terminal dialog — dark, sharp, appears after rotation */}
      <AnimatePresence>
        {dialogOpen && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: '8%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, delay: 0.5, ease: [0.23, 1, 0.32, 1] },
              }}
              exit={{
                opacity: 0,
                y: 6,
                transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
              }}
              className="terminal-dialog"
            >
              <div className="terminal-dialog__body">
                <p className="terminal-dialog__line">
                  &ldquo;He who overcomes suffering and fear will become god.&rdquo;
                </p>

                <div className="terminal-dialog__divider" />

                <p className="terminal-dialog__sub">
                  Fyodor Dostoevsky<span className="terminal-dialog__cursor" />
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3D model — stone textures applied programmatically on load */}
      {/* 3D model — no camera-controls so pointer doesn't interfere */}
      {isNearViewport ? (
        <model-viewer
          ref={(el: HTMLElement | null) => {
            modelRef.current = el;
            if (el) el.addEventListener("load", onModelLoad);
          }}
          src="/portfolio/dostoevsky-rock.glb"
          alt="3D statue of Fyodor Dostoevsky"
          loading="lazy"
          reveal="auto"
          interaction-prompt="none"
          camera-orbit={isZoomed ? zoomedOrbit : defaultOrbit}
          camera-target={isZoomed && faceTarget ? faceTarget : defaultTarget}
          field-of-view={isZoomed ? zoomedFov : defaultFov}
          interpolation-decay="200"
          exposure="2.2"
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
            contain: "layout style paint",
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

export default DostoevskyBust;
