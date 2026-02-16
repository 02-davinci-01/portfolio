"use client";

import { memo, useId, useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ── Types ── */
interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  icon?: "client" | "server" | "database";
}

interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  /** offset curve (positive = curve down, negative = curve up) */
  curveOffset?: number;
  /** show traveling dot on this edge — default true */
  showDot?: boolean;
  /** Which side of the source node to connect from — default "bottom" */
  fromAnchor?: "top" | "bottom" | "left" | "right";
  /** Which side of the target node to connect to — default "top" */
  toAnchor?: "top" | "bottom" | "left" | "right";
}

interface DiagramLayer {
  label: string;
  /** y position of the divider line */
  y: number;
}

interface FlowDiagramProps {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  /** SVG viewBox width — default 720 */
  width?: number;
  /** SVG viewBox height — default 320 */
  height?: number;
  /** Show a subtle dot-grid background (blueprint feel) */
  showGrid?: boolean;
  /** Horizontal layer dividers with labels */
  layers?: DiagramLayer[];
  className?: string;
}

/* ── Easing ── */
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Tiny icons (hand-drawn feel, monochrome) ── */
function NodeIcon({ type, size = 22 }: { type: DiagramNode["icon"]; size?: number }) {
  const s = size;
  if (type === "client") {
    // simple monitor icon
    return (
      <g>
        <rect x={-s / 2} y={-s / 2} width={s} height={s * 0.65} rx={2} fill="none" stroke="#111" strokeWidth={1.2} />
        <line x1={0} y1={s * 0.15} x2={0} y2={s * 0.35} stroke="#111" strokeWidth={1.2} />
        <line x1={-s * 0.2} y1={s * 0.35} x2={s * 0.2} y2={s * 0.35} stroke="#111" strokeWidth={1.2} />
      </g>
    );
  }
  if (type === "server") {
    // stacked rectangles
    const bh = s * 0.22;
    return (
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect
              x={-s / 2}
              y={-s / 2 + i * (bh + 2)}
              width={s}
              height={bh}
              rx={2}
              fill="none"
              stroke="#111"
              strokeWidth={1.2}
            />
            <circle cx={s / 2 - 5} cy={-s / 2 + i * (bh + 2) + bh / 2} r={1.5} fill="#111" />
          </g>
        ))}
      </g>
    );
  }
  if (type === "database") {
    // cylinder
    const rx = s / 2;
    const ry = s * 0.14;
    const h = s * 0.55;
    return (
      <g>
        <ellipse cx={0} cy={-h / 2} rx={rx} ry={ry} fill="none" stroke="#111" strokeWidth={1.2} />
        <line x1={-rx} y1={-h / 2} x2={-rx} y2={h / 2} stroke="#111" strokeWidth={1.2} />
        <line x1={rx} y1={-h / 2} x2={rx} y2={h / 2} stroke="#111" strokeWidth={1.2} />
        <ellipse cx={0} cy={h / 2} rx={rx} ry={ry} fill="none" stroke="#111" strokeWidth={1.2} />
      </g>
    );
  }
  return null;
}

/* ── Anchor point helper ── */
function getAnchorPoint(
  node: DiagramNode,
  anchor: "top" | "bottom" | "left" | "right"
): { x: number; y: number } {
  switch (anchor) {
    case "top":    return { x: node.x + node.width / 2, y: node.y };
    case "bottom": return { x: node.x + node.width / 2, y: node.y + node.height };
    case "left":   return { x: node.x, y: node.y + node.height / 2 };
    case "right":  return { x: node.x + node.width, y: node.y + node.height / 2 };
  }
}

/* ── Edge path builder ── */
function buildEdgePath(
  from: DiagramNode,
  to: DiagramNode,
  curveOffset = 0,
  fromAnchor: "top" | "bottom" | "left" | "right" = "bottom",
  toAnchor: "top" | "bottom" | "left" | "right" = "top"
): string {
  const p1 = getAnchorPoint(from, fromAnchor);
  const p2 = getAnchorPoint(to, toAnchor);

  if (curveOffset === 0) {
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
  }

  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2 + curveOffset;
  return `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;
}

/* ── Edge label position ── */
function edgeLabelPos(
  from: DiagramNode,
  to: DiagramNode,
  curveOffset = 0,
  fromAnchor: "top" | "bottom" | "left" | "right" = "bottom",
  toAnchor: "top" | "bottom" | "left" | "right" = "top"
) {
  const p1 = getAnchorPoint(from, fromAnchor);
  const p2 = getAnchorPoint(to, toAnchor);

  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2 + curveOffset * 0.5 - 8,
  };
}

/* ── Component ── */
const FlowDiagram = memo(function FlowDiagram({
  nodes,
  edges,
  width = 720,
  height = 320,
  showGrid = false,
  layers,
  className = "",
}: FlowDiagramProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const uid = useId().replace(/:/g, "");

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <motion.svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-auto select-none ${className}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      aria-label="Architecture diagram"
      role="img"
    >
      <defs>
        {/* Arrowhead marker */}
        <marker
          id={`arrow-${uid}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="#bbb" strokeWidth={1.5} />
        </marker>

        {/* Traveling dot gradient */}
        <radialGradient id={`dotGlow-${uid}`}>
          <stop offset="0%" stopColor="#2B3A4E" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#2B3A4E" stopOpacity={0} />
        </radialGradient>

        {/* Dot grid pattern */}
        {showGrid && (
          <pattern id={`flow-dot-grid-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.5" fill="#D4D4D4" />
          </pattern>
        )}
      </defs>

      {/* ── Grid background ── */}
      {showGrid && (
        <rect width={width} height={height} fill={`url(#flow-dot-grid-${uid})`} />
      )}

      {/* ── Layer dividers ── */}
      {layers?.map((layer, i) => (
        <g key={`layer-${i}`}>
          {/* Dashed divider line */}
          <motion.line
            x1={20}
            y1={layer.y}
            x2={width - 20}
            y2={layer.y}
            stroke="#E0E0E0"
            strokeWidth={0.7}
            strokeDasharray="5 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: EASE_OUT }}
          />
          {/* Layer label */}
          <motion.text
            x={24}
            y={layer.y - 6}
            className="fill-neutral-300"
            style={{
              fontSize: "0.42rem",
              fontFamily: "var(--font-jetbrains), monospace",
              letterSpacing: "0.25em",
              textTransform: "uppercase" as const,
            }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1, ease: EASE_OUT }}
          >
            {layer.label}
          </motion.text>
        </g>
      ))}

      {/* ── Edges ── */}
      {edges.map((edge, i) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;

        const fA = edge.fromAnchor ?? "bottom";
        const tA = edge.toAnchor ?? "top";
        const path = buildEdgePath(from, to, edge.curveOffset, fA, tA);
        const labelPos = edgeLabelPos(from, to, edge.curveOffset, fA, tA);

        return (
          <g key={`edge-${i}`}>
            {/* Static line */}
            <motion.path
              d={path}
              fill="none"
              stroke="#ddd"
              strokeWidth={1.2}
              strokeDasharray="6 4"
              markerEnd={`url(#arrow-${uid})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{
                pathLength: { duration: 0.8, delay: 0.3 + i * 0.15, ease: EASE_OUT },
                opacity: { duration: 0.3, delay: 0.3 + i * 0.15 },
              }}
            />

            {/* Traveling dot — opt-out via showDot: false */}
            {isInView && edge.showDot !== false && (
              <circle r={3} fill="#2B3A4E">
                <animateMotion
                  dur={`${2.5 + i * 0.3}s`}
                  repeatCount="indefinite"
                  begin={`${0.8 + i * 0.15}s`}
                >
                  <mpath href={`#fp-${uid}-${i}`} />
                </animateMotion>
              </circle>
            )}

            {/* Hidden path for animateMotion reference */}
            <path
              id={`fp-${uid}-${i}`}
              d={path}
              fill="none"
              stroke="none"
            />

            {/* Edge label */}
            {edge.label && (
              <motion.text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                className="fill-neutral-400"
                style={{
                  fontSize: "0.55rem",
                  fontFamily: "var(--font-jetbrains), monospace",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                }}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.15, ease: EASE_OUT }}
              >
                {edge.label}
              </motion.text>
            )}
          </g>
        );
      })}

      {/* ── Nodes ── */}
      {nodes.map((node, i) => (
        <motion.g
          key={node.id}
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: EASE_OUT }}
        >
          {/* Node box */}
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={4}
            fill="#FFFFFF"
            stroke="#E5E5E5"
            strokeWidth={1}
          />

          {/* Icon */}
          {node.icon && (
            <g transform={`translate(${node.x + node.width / 2}, ${node.y + node.height * 0.38})`}>
              <NodeIcon type={node.icon} size={24} />
            </g>
          )}

          {/* Label */}
          <text
            x={node.x + node.width / 2}
            y={node.y + node.height * (node.icon ? 0.78 : 0.45)}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-neutral-900"
            style={{
              fontSize: "0.7rem",
              fontFamily: "var(--font-space), sans-serif",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            {node.label}
          </text>

          {/* Sublabel */}
          {node.sublabel && (
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height * (node.icon ? 0.92 : 0.65)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-neutral-400"
              style={{
                fontSize: "0.5rem",
                fontFamily: "var(--font-jetbrains), monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
              }}
            >
              {node.sublabel}
            </text>
          )}
        </motion.g>
      ))}
    </motion.svg>
  );
});

export default FlowDiagram;
