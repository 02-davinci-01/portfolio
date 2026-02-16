"use client";

import { useRef, useState, useCallback, useEffect, memo } from "react";
import { motion, useInView } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

interface ScrambleTextProps {
  /** Text shown by default */
  defaultText: string;
  /** Text revealed on hover via scramble effect */
  revealText: string;
  className?: string;
  /** Duration per character resolve in ms */
  charSpeed?: number;
}

/**
 * ScrambleText — shows `defaultText`, on hover scrambles into `revealText`.
 * Each character resolves sequentially from left to right.
 * Uses rAF + refs for animation state (no re-renders during scramble).
 */
const ScrambleText = memo(function ScrambleText({
  defaultText,
  revealText,
  className = "",
  charSpeed = 40,
}: ScrambleTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef<number>(0);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Determine the max length to display
  const maxLen = Math.max(defaultText.length, revealText.length);

  // Pad texts to equal length
  const from = hovered ? defaultText.padEnd(maxLen, " ") : revealText.padEnd(maxLen, " ");
  const to = hovered ? revealText.padEnd(maxLen, " ") : defaultText.padEnd(maxLen, " ");

  const scramble = useCallback(() => {
    cancelAnimationFrame(rafRef.current);

    const startTime = performance.now();
    // Phase 1: all chars scramble gently
    // Phase 2: characters lock in left-to-right
    const scrambleDuration = 150; // ms of scramble before resolving
    const resolveDuration = maxLen * charSpeed;
    const totalDuration = scrambleDuration + resolveDuration;
    let lastScrambleUpdate = 0;
    const scrambleInterval = 35; // ms between random char swaps

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // How many characters have resolved (0 during scramble phase)
      const resolveProgress = Math.max(0, (elapsed - scrambleDuration) / resolveDuration);
      const resolvedCount = Math.floor(Math.min(resolveProgress, 1) * maxLen);

      // Throttle scramble updates so chars don't flicker every frame
      const shouldUpdateScramble = now - lastScrambleUpdate > scrambleInterval;
      if (shouldUpdateScramble) lastScrambleUpdate = now;

      spanRefs.current.forEach((span, i) => {
        if (!span) return;
        if (i < resolvedCount) {
          span.textContent = to[i] === " " ? "\u00A0" : to[i];
        } else if (shouldUpdateScramble) {
          span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      });

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        spanRefs.current.forEach((span, i) => {
          if (!span) return;
          span.textContent = to[i] === " " ? "\u00A0" : to[i];
        });
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [from, to, maxLen, charSpeed]);

  useEffect(() => {
    scramble();
    return () => cancelAnimationFrame(rafRef.current);
  }, [hovered, scramble]);

  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  return (
    <span
      ref={containerRef}
      className={`inline-block cursor-default ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label={hovered ? revealText : defaultText}
      data-cursor-hover
    >
      {Array.from({ length: maxLen }).map((_, i) => (
        <motion.span
          key={i}
          ref={(el) => { spanRefs.current[i] = el; }}
          className="inline-block"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{
            duration: 0.5,
            delay: i * 0.025,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{
            whiteSpace: "pre",
            willChange: isInView ? "auto" : "transform, opacity",
          }}
        >
          {(hovered ? from : defaultText.padEnd(maxLen, " "))[i] === " "
            ? "\u00A0"
            : (hovered ? from : defaultText.padEnd(maxLen, " "))[i]}
        </motion.span>
      ))}
    </span>
  );
});

export default ScrambleText;
