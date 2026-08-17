import type { SchematicKey } from "@/app/scripta/content";

/* ═══════════════════════════════════════════════════════════════════
   Schematic — the portfolio's node-graph diagram language, steel-blue
   on transparent. One 260×60 source per key; rendered small in ledger
   rows and large inside the article hero frame. Placeholder set — swap
   or extend as real posts get their own diagrams.
   ═══════════════════════════════════════════════════════════════════ */

const STROKE = "#2b3a4e";

const GLYPHS: Record<SchematicKey, React.ReactNode> = {
  tree: (
    <>
      <g stroke={STROKE} strokeWidth={1} fill="none">
        <rect x="6" y="22" width="40" height="16" />
        <rect x="72" y="6" width="40" height="16" />
        <rect x="72" y="38" width="40" height="16" />
        <rect x="152" y="6" width="40" height="16" />
        <rect x="152" y="38" width="40" height="16" />
        <path d="M46 30 L72 14 M46 30 L72 46 M112 14 L152 14 M112 46 L152 46" />
      </g>
      <circle cx="26" cy="30" r="2.5" fill={STROKE} />
      <circle cx="172" cy="14" r="2.5" fill={STROKE} />
    </>
  ),
  p2p: (
    <g stroke={STROKE} strokeWidth={1} fill="none">
      <rect x="6" y="20" width="46" height="20" />
      <rect x="104" y="4" width="46" height="18" />
      <rect x="200" y="20" width="46" height="20" />
      <path d="M52 30 L104 13 M150 13 L200 30 M52 33 L200 33" strokeDasharray="3 3" />
    </g>
  ),
  pipe: (
    <>
      <g stroke={STROKE} strokeWidth={1} fill="none">
        <rect x="8" y="18" width="52" height="24" />
        <rect x="104" y="18" width="52" height="24" />
        <rect x="200" y="18" width="52" height="24" />
        <path d="M60 30 L104 30 M156 30 L200 30" />
      </g>
      <circle cx="34" cy="30" r="2.5" fill={STROKE} />
      <circle cx="226" cy="30" r="2.5" fill={STROKE} />
    </>
  ),
  loop: (
    <>
      <path
        d="M20 46 C20 12 68 12 68 30 C68 48 116 48 116 30 C116 12 164 12 164 30 C164 48 212 48 212 30 C212 12 244 12 244 30"
        stroke={STROKE}
        strokeWidth={1}
        fill="none"
      />
      <circle cx="20" cy="46" r="2.5" fill={STROKE} />
      <circle cx="244" cy="30" r="2.5" fill={STROKE} />
    </>
  ),
  cache: (
    <g stroke={STROKE} strokeWidth={1} fill="none">
      <rect x="8" y="8" width="36" height="14" />
      <rect x="8" y="34" width="36" height="14" />
      <rect x="66" y="21" width="36" height="18" />
      <rect x="168" y="21" width="84" height="18" />
      <path d="M44 15 L66 28 M44 41 L66 32 M102 30 L168 30" />
    </g>
  ),
  graph: (
    <g stroke={STROKE} strokeWidth={1} fill="none">
      <circle cx="30" cy="30" r="4" />
      <circle cx="110" cy="14" r="4" />
      <circle cx="110" cy="46" r="4" />
      <circle cx="200" cy="30" r="4" />
      <circle cx="250" cy="14" r="4" />
      <path d="M34 28 L106 15 M34 32 L106 45 M114 15 L196 29 M114 45 L196 31 M204 29 L246 15" />
    </g>
  ),
  /* *ptr — a cursor arrow (with the creature's two eyes) reading a budget
     bar that fills, then depletes toward null. */
  ptr: (
    <>
      <g stroke={STROKE} strokeWidth={1} fill="none" strokeLinejoin="round">
        <path d="M18 9 L18 51 L29 40 L36 55 L42 52 L35 38 L48 38 Z" />
      </g>
      <circle cx="24" cy="19" r="1.6" fill={STROKE} />
      <circle cx="30" cy="19" r="1.6" fill={STROKE} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={90 + i * 13}
          y={25}
          width={9}
          height={12}
          rx={1}
          fill={i < 5 ? STROKE : "none"}
          stroke={STROKE}
          strokeWidth={0.8}
        />
      ))}
    </>
  ),
};

export default function Schematic({
  name,
  size = "sm",
}: {
  name: SchematicKey;
  size?: "sm" | "lg";
}) {
  const inner = GLYPHS[name] ?? GLYPHS.graph;
  const dims = size === "lg" ? { width: 420, height: 97 } : { width: 260, height: 60 };
  return (
    <svg
      width={dims.width}
      height={dims.height}
      viewBox="0 0 260 60"
      fill="none"
      aria-hidden="true"
      style={{ maxWidth: "100%" }}
    >
      {inner}
    </svg>
  );
}
