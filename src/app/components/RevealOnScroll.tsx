"use client";

import { useRef, memo, useMemo } from "react";
import { motion, useInView } from "framer-motion";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

const directionMap = {
  up: { y: 60, x: 0 },
  left: { y: 0, x: -60 },
  right: { y: 0, x: 60 },
} as const;

const RevealOnScroll = memo(function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: RevealOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const offsets = directionMap[direction];

  const transition = useMemo(
    () => ({ duration: 0.9, delay, ease: [0.23, 1, 0.32, 1] as const }),
    [delay]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: offsets.y, x: offsets.x }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : undefined
      }
      transition={transition}
    >
      {children}
    </motion.div>
  );
});

export default RevealOnScroll;
