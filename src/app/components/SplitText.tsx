"use client";

import { useRef, useMemo, memo } from "react";
import { motion, useInView } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  staggerDelay?: number;
}

/**
 * SplitText — optimized:
 * - Memoized character array to avoid re-splitting on every render
 * - Wrapped in React.memo to skip re-renders when props unchanged
 * - Uses `transform` shorthand for GPU compositing
 */
const SplitText = memo(function SplitText({
  text,
  className = "",
  charClassName = "",
  staggerDelay = 0.03,
}: SplitTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const chars = useMemo(() => text.split(""), [text]);

  return (
    <span ref={ref} className={`inline-block ${className}`} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className={`inline-block ${charClassName}`}
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={
            isInView
              ? { opacity: 1, y: 0, rotateX: 0 }
              : undefined
          }
          transition={{
            duration: 0.6,
            delay: i * staggerDelay,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : "normal",
            willChange: isInView ? "auto" : "transform, opacity",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
});

export default SplitText;
