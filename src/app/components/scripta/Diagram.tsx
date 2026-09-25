"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { DiagramKey } from "@/app/scripta/content";
import { Chain, Handshake, Mitm, OffloadTall, OffloadWide, Paint, Signature } from "./figures";

/* "once" figures play their build-up the first time they scroll into view
   (with a replay button); "loop" figures run only while on screen. */
const FIGURES: Record<DiagramKey, { mode: "once" | "loop"; render: () => ReactNode; legend?: ReactNode }> = {
  offload: {
    mode: "loop",
    render: () => (
      <>
        <OffloadWide />
        <OffloadTall />
      </>
    ),
    legend: (
      <>
        <span>
          <i className="sw sw-enc" />
          HTTPS · encrypted
        </span>
        <span>
          <i className="sw sw-pln" />
          HTTP · plain
        </span>
      </>
    ),
  },
  paint: { mode: "once", render: () => <Paint /> },
  mitm: { mode: "once", render: () => <Mitm /> },
  signature: { mode: "once", render: () => <Signature /> },
  chain: { mode: "once", render: () => <Chain /> },
  handshake: { mode: "once", render: () => <Handshake /> },
};

function useFigurePlay(mode: "once" | "loop") {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (mode === "loop") {
          setPlay(entry.isIntersecting);
        } else if (entry.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  return { ref, play };
}

/** Bare diagram — for the article hero, which supplies its own frame. */
export function HeroDiagram({ name }: { name: DiagramKey }) {
  const fig = FIGURES[name];
  const { ref, play } = useFigurePlay(fig.mode);
  return (
    <div className="dg-hero">
      <div ref={ref} className={`dg ${fig.mode}${play ? " play" : ""}`}>
        {fig.render()}
      </div>
      {fig.legend && <div className="dg-legend">{fig.legend}</div>}
    </div>
  );
}

/** Framed, numbered figure for the reading column. */
export default function Diagram({ name, fig: label, caption }: { name: DiagramKey; fig: string; caption?: string }) {
  const fig = FIGURES[name];
  const { ref, play } = useFigurePlay(fig.mode);
  const [take, setTake] = useState(0); // bump to remount → animations restart

  return (
    <figure className="dgfig">
      <div className="dg-frame" data-fig={label}>
        <div ref={ref} className={`dg ${fig.mode}${play ? " play" : ""}`} key={take}>
          {fig.render()}
        </div>
        {fig.legend && <div className="dg-legend">{fig.legend}</div>}
        {fig.mode === "once" && (
          <button
            type="button"
            className="dg-replay"
            onClick={() => setTake((t) => t + 1)}
            aria-label={`Replay ${label}`}
          >
            ↻ replay
          </button>
        )}
      </div>
      {caption && <figcaption className="figcap">{caption}</figcaption>}
    </figure>
  );
}
