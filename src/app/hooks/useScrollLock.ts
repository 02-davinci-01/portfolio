"use client";

import { useEffect, useRef } from "react";

/**
 * useScrollLock — locks page scroll when a modal is open.
 *
 * Strategy: JS event prevention (wheel / touchmove / scrollable keys).
 *
 * Why NOT `overflow: hidden`?
 * ──────────────────────────
 * `overflow: hidden` removes the scrollbar, causing:
 *  1. Layout shift (content widens by ~15-17px)
 *  2. Scrollbar flash on open/close — visually jarring
 *
 * Instead we stop Lenis and intercept native scroll events.
 * The scrollbar stays visible (but inert), so:
 *  - No layout shift
 *  - No `paddingRight` compensation hack
 *  - No Lenis desync on close
 *
 * @param active  — whether the lock is currently engaged
 * @param bodyClass — CSS class added to `<body>` while locked (e.g. "music-modal-open")
 */

const SCROLL_KEYS = new Set([
  "ArrowUp", "ArrowDown", "Space", "PageUp", "PageDown", "Home", "End",
]);

export function useScrollLock(active: boolean, bodyClass?: string) {
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    lockedRef.current = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = (window as any).__lenis;

    // Stop Lenis — prevents smooth scroll processing
    lenis?.stop();

    // Prevent native scroll via event interception
    const preventWheel = (e: WheelEvent) => {
      // Allow scrolling inside the modal itself (e.g. long content)
      const target = e.target as HTMLElement;
      if (target.closest("[data-modal-scrollable]")) return;
      e.preventDefault();
    };

    const preventTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-modal-scrollable]")) return;
      e.preventDefault();
    };

    const preventKeys = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.code)) {
        const target = e.target as HTMLElement;
        if (target.closest("[data-modal-scrollable]")) return;
        e.preventDefault();
      }
    };

    // { passive: false } required to call preventDefault on wheel/touch
    window.addEventListener("wheel", preventWheel, { passive: false });
    window.addEventListener("touchmove", preventTouch, { passive: false });
    window.addEventListener("keydown", preventKeys);

    if (bodyClass) {
      document.body.classList.add(bodyClass);
    }

    return () => {
      lockedRef.current = false;

      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("touchmove", preventTouch);
      window.removeEventListener("keydown", preventKeys);

      if (bodyClass) {
        document.body.classList.remove(bodyClass);
      }

      // Delay Lenis restart to let the exit animation finish (~550ms).
      // If we restart immediately, Lenis captures the first post-close
      // wheel event and can twitch the scroll position.
      setTimeout(() => lenis?.start(), 560);
    };
  }, [active, bodyClass]);
}
