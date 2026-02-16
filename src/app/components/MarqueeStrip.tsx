"use client";

import { memo, useMemo } from "react";

interface MarqueeStripProps {
  words: string[];
  reverse?: boolean;
  className?: string;
}

const MarqueeStrip = memo(function MarqueeStrip({
  words,
  reverse = false,
  className = "",
}: MarqueeStripProps) {
  const repeated = useMemo(() => {
    const content = words.join(" — ");
    return `${content} — ${content} — ${content} — `;
  }, [words]);

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className={reverse ? "marquee-track-reverse" : "marquee-track"}>
        <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-neutral-300 pr-4">
          {repeated}
        </span>
        <span className="font-mono text-[0.65rem] tracking-[0.25em] uppercase text-neutral-300 pr-4">
          {repeated}
        </span>
      </div>
    </div>
  );
});

export default MarqueeStrip;
