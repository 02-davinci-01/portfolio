"use client";

import { useEffect, useRef, memo } from "react";

/**
 * CustomCursor — tiny clean pointer.
 * Subtle scale on hover/click. No tilt, no stem.
 * Skips on touch/mobile/reduced-motion. GPU-composited.
 */
const CustomCursor = memo(function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: -100, y: -100 });
  const scaleRef = useRef(1);
  const targetScaleRef = useRef(1);
  const isDownRef = useRef(false);
  const isHoveringRef = useRef(false);
  const hoveredElRef = useRef<Element | null>(null);

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(max-width: 768px)").matches;

    if (isTouchDevice) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = cursorRef.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
    };

    const onMouseDown = () => {
      isDownRef.current = true;
      targetScaleRef.current = 0.85;
    };

    const onMouseUp = () => {
      isDownRef.current = false;
      targetScaleRef.current = isHoveringRef.current ? 1.1 : 1;
    };

    const onHoverStart = (e: Event) => {
      isHoveringRef.current = true;
      hoveredElRef.current = e.currentTarget as Element;
      if (!isDownRef.current) targetScaleRef.current = 1.1;
      el.classList.add("cursor-arrow--hovering");
    };

    const onHoverEnd = () => {
      isHoveringRef.current = false;
      hoveredElRef.current = null;
      if (!isDownRef.current) targetScaleRef.current = 1.0;
      el.classList.remove("cursor-arrow--hovering");
    };

    const animate = () => {
      const { x, y } = posRef.current;
      scaleRef.current += (targetScaleRef.current - scaleRef.current) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scaleRef.current.toFixed(3)})`;
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    rafRef.current = requestAnimationFrame(animate);

    // Attach hover listeners to interactive elements
    const attachHoverListeners = () => {
      const interactiveEls = document.querySelectorAll(
        "a, button, [data-cursor-hover]"
      );
      interactiveEls.forEach((el) => {
        el.addEventListener("mouseenter", onHoverStart);
        el.addEventListener("mouseleave", onHoverEnd);
      });
      return interactiveEls;
    };

    let interactiveEls = attachHoverListeners();

    // Re-attach on DOM changes (e.g. modal open/close)
    const observer = new MutationObserver(() => {
      // If the hovered element was removed from the DOM, reset hover state
      if (hoveredElRef.current && !document.body.contains(hoveredElRef.current)) {
        isHoveringRef.current = false;
        hoveredElRef.current = null;
        if (!isDownRef.current) targetScaleRef.current = 1.0;
        el.classList.remove("cursor-arrow--hovering");
      }
      // Clean up old listeners
      interactiveEls.forEach((el) => {
        el.removeEventListener("mouseenter", onHoverStart);
        el.removeEventListener("mouseleave", onHoverEnd);
      });
      interactiveEls = attachHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      observer.disconnect();
      interactiveEls.forEach((el) => {
        el.removeEventListener("mouseenter", onHoverStart);
        el.removeEventListener("mouseleave", onHoverEnd);
      });
    };
  }, []);

  return (
    <div ref={cursorRef} className="cursor-arrow" aria-hidden="true">
      {/* Default arrow */}
      <svg
        className="cursor-arrow__default"
        width="14"
        height="17"
        viewBox="0 0 14 17"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1 L1 15 L4.5 11.5 L9.5 11.5 Z"
          fill="#111"
          stroke="#ddd"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      {/* Hand pointer — shown on hover over clickables */}
      <svg
        className="cursor-arrow__hand"
        width="16"
        height="18"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 9.5 1 C 8.672 1 8 1.672 8 2.5 L 8 9 L 8 14 L 8 15.060547 L 5.3378906 13.710938 C 4.7798906 13.427938 4.1072344 13.492906 3.6152344 13.878906 C 2.8562344 14.474906 2.7887031 15.601203 3.4707031 16.283203 L 8.3085938 21.121094 C 8.8715937 21.684094 9.6346875 22 10.429688 22 L 17 22 C 18.657 22 20 20.657 20 19 L 20 12.193359 C 20 11.216359 19.292125 10.381703 18.328125 10.220703 L 11 9 L 11 2.5 C 11 1.672 10.328 1 9.5 1 z"
          fill="#111"
          stroke="#ddd"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

export default CustomCursor;
