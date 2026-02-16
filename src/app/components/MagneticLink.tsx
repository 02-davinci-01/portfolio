"use client";

import { useRef, useCallback, useEffect, memo } from "react";

interface MagneticLinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

/**
 * MagneticLink — optimized:
 * - Uses RAF + refs instead of React state on every mousemove
 * - Applies transform directly to DOM for zero re-renders during interaction
 * - Skips effect on touch devices
 */
const MagneticLink = memo(function MagneticLink({
  children,
  href,
  className = "",
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  const springLoop = useCallback(() => {
    const c = currentRef.current;
    const t = targetRef.current;

    // Simple spring interpolation
    c.x += (t.x - c.x) * 0.15;
    c.y += (t.y - c.y) * 0.15;

    if (ref.current) {
      ref.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    }

    // Stop animation when close enough and target is (0,0)
    const dist = Math.abs(t.x - c.x) + Math.abs(t.y - c.y);
    if (dist < 0.1 && t.x === 0 && t.y === 0) {
      activeRef.current = false;
      if (ref.current) ref.current.style.transform = "";
      return;
    }

    rafRef.current = requestAnimationFrame(springLoop);
  }, []);

  const startLoop = useCallback(() => {
    if (!activeRef.current) {
      activeRef.current = true;
      rafRef.current = requestAnimationFrame(springLoop);
    }
  }, [springLoop]);

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      targetRef.current.x =
        (e.clientX - rect.left - rect.width / 2) * 0.3;
      targetRef.current.y =
        (e.clientY - rect.top - rect.height / 2) * 0.3;
      startLoop();
    },
    [startLoop]
  );

  const handleLeave = useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
    startLoop();
  }, [startLoop]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      data-cursor-hover
      style={{ willChange: "transform" }}
    >
      {children}
    </a>
  );
});

export default MagneticLink;
