"use client";

import { useEffect } from "react";

/**
 * Fixed top progress bar + TOC scroll-spy. Reads the DOM directly (like the
 * design mockup) so the article body can stay server-rendered: it watches the
 * `#scripta-toc a` links and the `h2[id]` sections they point at.
 */
export default function ReadingProgress() {
  useEffect(() => {
    const bar = document.getElementById("scripta-progress");
    const tocLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>("#scripta-toc a")
    );
    const sections = tocLinks.map((a) =>
      document.querySelector<HTMLElement>(a.getAttribute("href") || "")
    );

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";

      let active = 0;
      sections.forEach((s, i) => {
        if (s && s.getBoundingClientRect().top <= 140) active = i;
      });
      tocLinks.forEach((a, i) => a.classList.toggle("on", i === active));
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="progress" id="scripta-progress" />;
}
