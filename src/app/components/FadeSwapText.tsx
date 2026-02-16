"use client";

import { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";

interface FadeSwapTextProps {
  defaultText: string;
  revealText: string;
  className?: string;
}

/**
 * FadeSwapText — smooth overlapping opacity crossfade on hover.
 * Both texts exist in the DOM; one fades out while the other fades in.
 * No movement, no blur — just a clean dissolve. Minimal and glitch-free.
 */
const FadeSwapText = memo(function FadeSwapText({
  defaultText,
  revealText,
  className = "",
}: FadeSwapTextProps) {
  const [hovered, setHovered] = useState(false);
  const onEnter = useCallback(() => setHovered(true), []);
  const onLeave = useCallback(() => setHovered(false), []);

  return (
    <span
      className={`inline-block relative cursor-default ${className}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      data-cursor-hover
    >
      {/* Invisible sizer — always holds the wider text to prevent layout shift */}
      <span className="invisible whitespace-pre" aria-hidden>
        {revealText.length >= defaultText.length ? revealText : defaultText}
      </span>

      {/* Default text — fades out on hover */}
      <motion.span
        className="absolute inset-0 whitespace-pre"
        animate={{ opacity: hovered ? 0 : 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {defaultText}
      </motion.span>

      {/* Reveal text — fades in on hover */}
      <motion.span
        className="absolute inset-0 whitespace-pre"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {revealText}
      </motion.span>
    </span>
  );
});

export default FadeSwapText;
