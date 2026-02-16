"use client";

import { memo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SectionHeadingProps {
  latin: ReactNode;
  english: ReactNode;
  index: string;
  className?: string;
}

/**
 * SectionHeading — displays a Latin heading that reveals
 * its English translation on hover. The index number sits
 * as an oversized ghost beside it.
 */
const SectionHeading = memo(function SectionHeading({
  latin,
  english,
  index,
  className = "",
}: SectionHeadingProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`section-heading-wrapper group ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Oversized ghost index */}
      <span className="index-number select-none" aria-hidden="true">
        {index}
      </span>

      {/* Heading with Latin/English flip */}
      <div className="relative mt-4 md:mt-6">
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-tighter leading-[0.9] text-neutral-900 font-[family-name:var(--font-space)]">
          <AnimatePresence mode="wait">
            {hovered ? (
              <motion.span
                key="english"
                className="inline-block"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {english}
              </motion.span>
            ) : (
              <motion.span
                key="latin"
                className="inline-block latin-heading"
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {latin}
              </motion.span>
            )}
          </AnimatePresence>
        </h2>

        {/* Subtle hint */}
        <motion.span
          className="block font-mono text-[0.55rem] tracking-[0.4em] uppercase text-neutral-300 mt-2"
          animate={{ opacity: hovered ? 0 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          hover to translate
        </motion.span>
      </div>
    </div>
  );
});

export default SectionHeading;
