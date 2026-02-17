"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "@/app/lib/gsap";

const PHRASE = "veridis quo :)";

/**
 * Human-like per-character delays (ms).
 * Hand-tuned to feel like someone actually typing.
 */
function getCharDelay(char: string, index: number): number {
  if (index === 0) return 420;
  if (char === " ") return 180 + Math.random() * 100;
  if (char === ":") return 260 + Math.random() * 80;
  if (char === ")") return 90 + Math.random() * 40;
  if (char === "q") return 140 + Math.random() * 60;
  return 55 + Math.random() * 95;
}

/**
 * IntroScreen — full-black curtain → typing → mist dissolve.
 *
 * After typing completes:
 *   1. Text lifts away (Framer Motion)
 *   2. GSAP dissolves the backdrop: blur expands outward like dispersing mist,
 *      opacity fades, and a subtle scale lifts. Simultaneously, the portfolio
 *      content underneath comes into focus (blur → sharp, scale → 1).
 *   3. Component unmounts.
 */
function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [textExited, setTextExited] = useState(false);
  const [showText, setShowText] = useState(true);
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const typeNext = useCallback(() => {
    if (indexRef.current >= PHRASE.length) {
      setTypingDone(true);
      return;
    }
    const nextChar = PHRASE[indexRef.current];
    const delay = getCharDelay(nextChar, indexRef.current);
    timeoutRef.current = setTimeout(() => {
      indexRef.current += 1;
      setDisplayed(PHRASE.slice(0, indexRef.current));
      typeNext();
    }, delay);
  }, []);

  // Start typing after initial blink pause
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setDone(true);
      onComplete();
      return;
    }
    document.body.style.overflow = "hidden";
    timeoutRef.current = setTimeout(typeNext, 600);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [typeNext, onComplete]);

  // After typing finishes → hold, then start text exit
  useEffect(() => {
    if (!typingDone) return;
    const holdTimer = setTimeout(() => setShowText(false), 600);
    return () => clearTimeout(holdTimer);
  }, [typingDone]);

  // After text exits → veil lifts while hero materializes underneath
  useEffect(() => {
    if (!textExited || !backdropRef.current) return;

    // Fire hero entrance immediately — content materializes *through* the curtain
    document.body.style.overflow = "";
    onComplete();

    const tl = gsap.timeline({
      onComplete: () => setDone(true),
    });

    // Pure opacity fade — no blur/scale jank. The curtain lifts, content is already there.
    tl.to(backdropRef.current, {
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
    };
  }, [textExited, onComplete]);

  const handleTextExitDone = useCallback(() => {
    setTextExited(true);
  }, []);

  if (done) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        pointerEvents: textExited ? "none" : "auto",
      }}
    >
      {/* Black backdrop — dissolved by GSAP after text exits */}
      <div
        ref={backdropRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          willChange: "opacity",
        }}
      />

      {/* Text + cursor — lifts away via Framer Motion */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence onExitComplete={handleTextExitDone}>
          {showText && (
            <motion.div
              key="intro-text"
              style={{ display: "flex", alignItems: "center", gap: "2px" }}
              exit={{ opacity: 0, y: -20, scale: 1.04 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: "clamp(0.9rem, 2vw, 1.15rem)",
                  letterSpacing: "0.04em",
                  color: "rgba(255, 255, 255, 0.85)",
                  whiteSpace: "pre",
                }}
                aria-live="polite"
              >
                {displayed}
              </span>
              <span
                style={{
                  display: "inline-block",
                  width: "0.55em",
                  height: "1.15em",
                  background: "rgba(255, 255, 255, 0.85)",
                  verticalAlign: "text-bottom",
                  marginLeft: "1px",
                  animation: typingDone
                    ? "none"
                    : "cursor-blink 1s step-end infinite",
                  opacity: 1,
                }}
                aria-hidden="true"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(IntroScreen);
