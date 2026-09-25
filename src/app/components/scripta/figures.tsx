import type { CSSProperties, ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════
   Figures — hand-drawn SVG diagrams for Scripta articles.
   Drawn narrow-first (~340 user units wide) so the text stays legible
   on a phone; the wrapper caps their width on desktop.

   Motion vocabulary (styles in scripta.css, driven by Diagram.tsx):
     .rv  fades/rises in at --d once the figure is on screen
     .pop scales in at --d
     .mv  is drawn at its FINAL spot and travels in from (-dx, -dy),
          so with motion off it simply sits where it ends up
     .pk  looping traffic (hero only)
   ═══════════════════════════════════════════════════════════════════ */

type Vars = CSSProperties & Record<`--${string}`, string>;

const r2 = (n: number) => Math.round(n * 100) / 100;

function R({ at, pop, children }: { at: number; pop?: boolean; children: ReactNode }) {
  return (
    <g className={pop ? "pop" : "rv"} style={{ "--d": `${at}s` } as Vars}>
      {children}
    </g>
  );
}

function Mv({
  at,
  dx = 0,
  dy = 0,
  dur = 1.2,
  linear,
  children,
}: {
  at: number;
  dx?: number;
  dy?: number;
  dur?: number;
  linear?: boolean;
  children: ReactNode;
}) {
  const style: Vars = { "--d": `${at}s`, "--dx": `${dx}px`, "--dy": `${dy}px`, "--dur": `${dur}s` };
  if (linear) style["--ease"] = "linear";
  return (
    <g className="mv" style={style}>
      {children}
    </g>
  );
}

/* text — c: t (body) · s (small/faint) · k (kicker caps) · h (heading) · a (accent) · i (inverse) */
function T({
  x,
  y,
  c = "t",
  a = "middle",
  children,
}: {
  x: number;
  y: number;
  c?: "t" | "s" | "k" | "h" | "a" | "i";
  a?: "start" | "middle" | "end";
  children: ReactNode;
}) {
  return (
    <text x={x} y={y} className={`dg-${c}`} textAnchor={a}>
      {c === "k" && typeof children === "string" ? children.toUpperCase() : children}
    </text>
  );
}

/* superscript that returns to the baseline for whatever follows it */
function Sup({ children }: { children: ReactNode }) {
  return (
    <>
      <tspan dy={-4} className="dg-sup">
        {children}
      </tspan>
      <tspan dy={4}>{"\u200a"}</tspan>
    </>
  );
}

function Ar({
  x1,
  y1,
  x2,
  y2,
  dash,
  strong,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dash?: boolean;
  strong?: boolean;
}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const L = 6;
  const W = 3.2;
  const bx = x2 - L * Math.cos(ang);
  const by = y2 - L * Math.sin(ang);
  const px = -Math.sin(ang) * W;
  const py = Math.cos(ang) * W;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={r2(bx)}
        y2={r2(by)}
        className={dash ? "dg-dash" : strong ? "dg-ln dg-strong" : "dg-ln"}
      />
      <path
        d={`M${x2} ${y2} L${r2(bx + px)} ${r2(by + py)} L${r2(bx - px)} ${r2(by - py)} Z`}
        className="dg-head"
      />
    </g>
  );
}

function Box({ x, y, w, h, soft, danger }: { x: number; y: number; w: number; h: number; soft?: boolean; danger?: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={2}
      className={danger ? "dg-box dg-danger" : soft ? "dg-box dg-soft" : "dg-box"}
    />
  );
}

/* padlock, body centred on (x, y) */
function Lock({ x, y, open, filled }: { x: number; y: number; open?: boolean; filled?: boolean }) {
  return (
    <g className="dg-lock">
      <path
        d={
          open
            ? `M${x - 4.5} ${y - 5} V${y - 10} a4.5 4.5 0 0 1 9 0 V${y - 8}`
            : `M${x - 4.5} ${y - 5} V${y - 9} a4.5 4.5 0 0 1 9 0 V${y - 5}`
        }
        className="dg-ln"
      />
      <rect x={x - 7} y={y - 5} width={14} height={11} rx={1.5} className={filled ? "dg-fill" : "dg-box"} />
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FIG. I — TLS offloading (hero, looping traffic)
   ───────────────────────────────────────────────────────────────── */

const PERIOD = 3.6; // one client → member trip; three clients staggered evenly

export function OffloadWide() {
  const rows = [58, 118, 178];
  const target = [1, 2, 0]; // client i is balanced onto member target[i]
  return (
    <svg viewBox="0 0 480 236" className="dg-svg dg-wide" role="img" aria-label="Three clients send encrypted HTTPS traffic to a load balancer, which terminates TLS and forwards plain HTTP to three backend members.">
      {rows.map((cy) => (
        <Ar key={`l${cy}`} x1={100} y1={cy} x2={180} y2={cy} strong />
      ))}
      {rows.map((cy) => (
        <Ar key={`r${cy}`} x1={300} y1={cy} x2={380} y2={cy} dash />
      ))}

      {rows.map((cy, i) => (
        <g key={`c${cy}`}>
          <Box x={8} y={cy - 19} w={92} h={38} />
          <T x={54} y={cy - 1} c="h">client {i + 1}</T>
          <T x={54} y={cy + 12} c="s">https://</T>
        </g>
      ))}

      <Box x={180} y={24} w={120} h={188} />
      <T x={240} y={48} c="h">LB</T>
      <T x={240} y={63} c="s">VIP · :443</T>
      <line x1={194} y1={78} x2={286} y2={78} className="dg-hair" />
      <circle cx={240} cy={112} r={20} className="pk pk-ring" style={{ "--delay": `${PERIOD * 0.4}s` } as Vars} />
      <Lock x={240} y={114} open />
      <T x={240} y={146} c="t">TLS ends here</T>
      <line x1={194} y1={160} x2={286} y2={160} className="dg-hair" />
      <T x={240} y={180} c="s">cert + key</T>
      <T x={240} y={195} c="s">← Barbican</T>

      {rows.map((cy, i) => (
        <g key={`m${cy}`}>
          <Box x={380} y={cy - 19} w={92} h={38} soft />
          <T x={426} y={cy - 1} c="h">member</T>
          <T x={426} y={cy + 12} c="s">10.0.0.{i + 1}:80</T>
        </g>
      ))}

      {rows.map((cy, i) => {
        const delay = `${(i * PERIOD) / 3}s`;
        const ty = rows[target[i]];
        return (
          <g key={`p${cy}`}>
            <rect x={160} y={cy - 5} width={14} height={10} rx={1.5} className="pk pk-enc" style={{ "--dx": "58px", "--dy": "0px", "--delay": delay } as Vars} />
            <rect x={304} y={ty - 5} width={14} height={10} rx={1.5} className="pk pk-pln" style={{ "--dx": "56px", "--dy": "0px", "--delay": delay } as Vars} />
          </g>
        );
      })}
    </svg>
  );
}

export function OffloadTall() {
  const cols = [50, 150, 250];
  const target = [1, 2, 0];
  return (
    <svg viewBox="0 0 300 354" className="dg-svg dg-tall" role="img" aria-label="Three clients send encrypted HTTPS traffic to a load balancer, which terminates TLS and forwards plain HTTP to three backend members.">
      {cols.map((cx) => (
        <Ar key={`l${cx}`} x1={cx} y1={50} x2={cx} y2={120} strong />
      ))}
      {cols.map((cx) => (
        <Ar key={`r${cx}`} x1={cx} y1={236} x2={cx} y2={304} dash />
      ))}

      {cols.map((cx, i) => (
        <g key={`c${cx}`}>
          <Box x={cx - 44} y={10} w={88} h={40} />
          <T x={cx} y={28} c="h">client {i + 1}</T>
          <T x={cx} y={42} c="s">https://</T>
        </g>
      ))}

      <Box x={14} y={120} w={272} h={116} />
      <T x={30} y={146} c="h" a="start">LB</T>
      <T x={30} y={161} c="s" a="start">VIP · :443</T>
      <circle cx={150} cy={168} r={20} className="pk pk-ring" style={{ "--delay": `${PERIOD * 0.4}s` } as Vars} />
      <Lock x={150} y={170} open />
      <T x={150} y={214} c="t">TLS ends here</T>
      <T x={270} y={146} c="s" a="end">cert + key</T>
      <T x={270} y={161} c="s" a="end">← Barbican</T>

      {cols.map((cx, i) => (
        <g key={`m${cx}`}>
          <Box x={cx - 44} y={304} w={88} h={40} soft />
          <T x={cx} y={322} c="h">member</T>
          <T x={cx} y={336} c="s">10.0.0.{i + 1}:80</T>
        </g>
      ))}

      {cols.map((cx, i) => {
        const delay = `${(i * PERIOD) / 3}s`;
        const tx = cols[target[i]];
        return (
          <g key={`p${cx}`}>
            <rect x={cx - 5} y={100} width={10} height={14} rx={1.5} className="pk pk-enc" style={{ "--dx": "0px", "--dy": "48px", "--delay": delay } as Vars} />
            <rect x={tx - 5} y={240} width={10} height={14} rx={1.5} className="pk pk-pln" style={{ "--dx": "0px", "--dy": "48px", "--delay": delay } as Vars} />
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FIG. II — Diffie–Hellman as paint
   yellow = g (public) · orange = a (Alice) · blue = b (Bob)
   ───────────────────────────────────────────────────────────────── */

const PAINT = {
  g: "#d9b54a",
  a: "#c9733a",
  b: "#4f73a0",
  A: "#d39445", // g + a
  B: "#7b9a5c", // g + b
  s: "#86693f", // g + a + b
};

function Blob({ x, y, fill, secret }: { x: number; y: number; fill: string; secret?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={11} fill={fill} className={secret ? "dg-blob dg-secret" : "dg-blob"} />
    </g>
  );
}

export function Paint() {
  return (
    <svg viewBox="0 0 340 322" className="dg-svg" role="img" aria-label="Paint-mixing analogy for Diffie–Hellman. Alice and Bob share a public yellow paint, each mixes in a secret colour, they swap the mixtures in public, then each adds their own secret again — both end up with the same brown, which never crossed the wire.">
      <R at={0}>
        <T x={62} y={14} c="k">alice</T>
        <T x={170} y={14} c="k">public</T>
        <T x={278} y={14} c="k">bob</T>
      </R>

      {/* 1 — common paint */}
      <R at={0.15} pop>
        <Blob x={170} y={46} fill={PAINT.g} />
      </R>
      <R at={0.35}>
        <T x={170} y={74} c="t">g, p</T>
        <line x1={157} y1={52} x2={30} y2={112} className="dg-dash" />
        <line x1={183} y1={52} x2={310} y2={112} className="dg-dash" />
      </R>

      {/* 2 — mix in a secret */}
      <R at={0.8} pop>
        <Blob x={22} y={124} fill={PAINT.g} />
        <Blob x={318} y={124} fill={PAINT.g} />
      </R>
      <R at={1.2}>
        <T x={41} y={128} c="t">+</T>
        <T x={81} y={128} c="t">=</T>
        <T x={255} y={128} c="t">=</T>
        <T x={297} y={128} c="t">+</T>
        <T x={170} y={121} c="s">mix in</T>
        <T x={170} y={133} c="s">a secret</T>
      </R>
      <R at={1.2} pop>
        <Blob x={60} y={124} fill={PAINT.a} secret />
        <Blob x={276} y={124} fill={PAINT.b} secret />
      </R>
      <R at={1.7} pop>
        <Blob x={104} y={124} fill={PAINT.A} />
        <Blob x={236} y={124} fill={PAINT.B} />
      </R>
      <R at={1.7}>
        <T x={22} y={152} c="s">g</T>
        <T x={60} y={152} c="a">a</T>
        <T x={104} y={152} c="t">A</T>
        <T x={236} y={152} c="t">B</T>
        <T x={276} y={152} c="a">b</T>
        <T x={318} y={152} c="s">g</T>
      </R>

      {/* 3 — swap in the open */}
      <R at={2.3}>
        <line x1={112} y1={134} x2={228} y2={240} className="dg-dash" />
        <line x1={228} y1={134} x2={112} y2={240} className="dg-dash" />
        <T x={150} y={185} c="s" a="end">swapped</T>
        <T x={150} y={197} c="s" a="end">in public</T>
        <T x={190} y={185} c="s" a="start">eve sees A, B —</T>
        <T x={190} y={197} c="s" a="start">can&apos;t un-mix</T>
      </R>
      <Mv at={2.6} dx={132} dy={126} dur={1.3}>
        <Blob x={236} y={250} fill={PAINT.A} />
      </Mv>
      <Mv at={2.6} dx={-132} dy={126} dur={1.3}>
        <Blob x={104} y={250} fill={PAINT.B} />
      </Mv>

      {/* 4 — add your own secret again */}
      <R at={4.0}>
        <T x={41} y={254} c="t">=</T>
        <T x={81} y={254} c="t">+</T>
        <T x={255} y={254} c="t">+</T>
        <T x={297} y={254} c="t">=</T>
        <T x={60} y={278} c="a">a</T>
        <T x={104} y={278} c="t">B</T>
        <T x={236} y={278} c="t">A</T>
        <T x={276} y={278} c="a">b</T>
      </R>
      <R at={4.0} pop>
        <Blob x={60} y={250} fill={PAINT.a} secret />
        <Blob x={276} y={250} fill={PAINT.b} secret />
      </R>
      <R at={4.6} pop>
        <Blob x={22} y={250} fill={PAINT.s} />
        <Blob x={318} y={250} fill={PAINT.s} />
      </R>

      {/* 5 — the reveal */}
      <R at={5.2}>
        <T x={22} y={278} c="h">s</T>
        <T x={318} y={278} c="h">s</T>
        <path d="M22 286 V300 H318 V286" className="dg-ln" fill="none" />
        <T x={170} y={316} c="a">same colour → shared secret s</T>
      </R>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FIG. III — man in the middle
   ───────────────────────────────────────────────────────────────── */

export function Mitm() {
  return (
    <svg viewBox="0 0 340 150" className="dg-svg" role="img" aria-label="Man in the middle: you run a Diffie–Hellman handshake with Mallory, and Mallory runs a separate one with the server. Both succeed; Mallory decrypts, reads, and re-encrypts everything.">
      <R at={0}>
        <path d="M40 76 Q170 8 300 76" className="dg-dash" fill="none" />
        <T x={170} y={34} c="s">what you think is happening</T>
      </R>
      <R at={0.3}>
        <Box x={4} y={80} w={72} h={32} />
        <T x={40} y={100} c="h">you</T>
        <Box x={264} y={80} w={72} h={32} />
        <T x={300} y={100} c="h">server</T>
      </R>
      <R at={0.8}>
        <Box x={132} y={80} w={76} h={32} danger />
        <T x={170} y={100} c="h">mallory</T>
        <line x1={76} y1={96} x2={132} y2={96} className="dg-ln" />
        <line x1={208} y1={96} x2={264} y2={96} className="dg-ln" />
        <T x={104} y={89} c="a">key s₁</T>
        <T x={236} y={89} c="a">key s₂</T>
      </R>
      <R at={1.4}>
        <T x={40} y={130} c="s">DH ✓</T>
        <T x={300} y={130} c="s">DH ✓</T>
        <T x={170} y={130} c="s">decrypts, reads,</T>
        <T x={170} y={142} c="s">re-encrypts</T>
      </R>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FIG. IV — sign with the private key, verify with the public one
   ───────────────────────────────────────────────────────────────── */

export function Signature() {
  return (
    <svg viewBox="0 0 340 300" className="dg-svg" role="img" aria-label="The CA hashes the certificate data and signs the hash with its private key. Your browser hashes the data itself, opens the signature with the CA's public key, and checks both hashes match.">
      <R at={0}>
        <T x={4} y={12} c="k" a="start">① sign — the CA, once</T>
        <Box x={4} y={26} w={74} h={30} />
        <T x={41} y={45} c="t">data</T>
        <Ar x1={78} y1={41} x2={118} y2={41} />
        <T x={98} y={34} c="s">hash</T>
      </R>
      <R at={0.4}>
        <circle cx={132} cy={41} r={14} className="dg-box" />
        <T x={132} y={45} c="t">h</T>
        <Ar x1={146} y1={41} x2={250} y2={41} />
        <T x={198} y={34} c="s">
          h<Sup>d</Sup> mod n
        </T>
        <T x={198} y={55} c="a">private key</T>
      </R>
      <R at={0.8}>
        <Box x={250} y={26} w={86} h={30} />
        <T x={293} y={45} c="t">sig</T>
      </R>
      <R at={1.2}>
        <path d="M41 56 V74 H111 V98 M293 56 V74 H229 V98" className="dg-ln" fill="none" />
        <Box x={60} y={88} w={220} h={44} soft />
        <T x={170} y={148} c="k">certificate</T>
        <Box x={72} y={98} w={78} h={24} />
        <T x={111} y={114} c="t">data</T>
        <Box x={190} y={98} w={78} h={24} />
        <T x={229} y={114} c="t">sig</T>
      </R>

      <R at={1.8}>
        <T x={4} y={158} c="k" a="start">② verify</T>
        <Ar x1={111} y1={132} x2={111} y2={200} />
        <T x={103} y={170} c="s" a="end">hash it</T>
        <T x={103} y={182} c="s" a="end">yourself</T>
        <circle cx={111} cy={214} r={14} className="dg-box" />
        <T x={111} y={218} c="t">h′</T>
      </R>
      <R at={2.2}>
        <Ar x1={229} y1={132} x2={229} y2={200} />
        <T x={237} y={164} c="s" a="start">
          sig<Sup>e</Sup> mod n
        </T>
        <T x={237} y={177} c="a" a="start">public key</T>
        <circle cx={229} cy={214} r={14} className="dg-box" />
        <T x={229} y={218} c="t">h</T>
      </R>
      <R at={2.8}>
        <path d="M121 224 L158 258 M219 224 L182 258" className="dg-ln" fill="none" />
        <circle cx={170} cy={268} r={16} className="dg-fill" />
        <T x={170} y={272} c="i">=?</T>
        <T x={194} y={266} c="a" a="start">match → untouched,</T>
        <T x={194} y={279} c="a" a="start">and really the CA ✓</T>
        <T x={146} y={266} c="s" a="end">differ →</T>
        <T x={146} y={279} c="s" a="end">tampered ✗</T>
      </R>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FIG. V — the chain of trust, checked bottom-up
   ───────────────────────────────────────────────────────────────── */

function Cert({ y, title, issuer, note }: { y: number; title: string; issuer: string; note: string }) {
  return (
    <g>
      <Box x={10} y={y} w={196} h={64} />
      <T x={22} y={y + 21} c="h" a="start">{title}</T>
      <T x={22} y={y + 38} c="t" a="start">{issuer}</T>
      <T x={22} y={y + 53} c="s" a="start">{note}</T>
    </g>
  );
}

function Tick({ y, label, at }: { y: number; label: string; at: number }) {
  return (
    <R at={at} pop>
      <circle cx={250} cy={y} r={9} className="dg-fill" />
      <path d={`M245.5 ${y} l3 3 l5.5 -6`} className="dg-tick" fill="none" />
      <T x={264} y={y + 4} c="a" a="start">{label}</T>
    </R>
  );
}

export function Chain() {
  return (
    <svg viewBox="0 0 340 340" className="dg-svg" role="img" aria-label="Certificate chain: github.com is signed by an intermediate CA, which is signed by a root CA that ships in your browser's trust store. Verification starts at the leaf and walks up.">
      <R at={0}>
        <rect x={2} y={24} width={212} height={92} rx={3} className="dg-store" />
        <T x={4} y={16} c="k" a="start">trust store · ships with your browser</T>
        <Cert y={40} title="Root CA" issuer="issuer: itself" note="self-signed" />
        <Cert y={156} title="Intermediate CA" issuer="issuer: Root CA" note="signed w/ Root's private key" />
        <Cert y={272} title="github.com" issuer="issuer: Intermediate CA" note="signed w/ Int's private key" />
        <Ar x1={58} y1={272} x2={58} y2={220} />
        <T x={66} y={250} c="s" a="start">signed by</T>
        <Ar x1={58} y1={156} x2={58} y2={104} />
        <T x={66} y={134} c="s" a="start">signed by</T>
      </R>

      <R at={0.5}>
        <line x1={250} y1={304} x2={250} y2={72} className="dg-rail" />
        <T x={250} y={324} c="s">↑ start here</T>
      </R>
      <Mv at={0.9} dy={-232} dur={2.6} linear>
        <circle cx={250} cy={72} r={4} className="dg-dot" />
      </Mv>
      <Tick y={246} label="leaf sig ok" at={1.55} />
      <Tick y={130} label="int sig ok" at={2.85} />
      <Tick y={72} label="root known" at={3.5} />
      <R at={3.9}>
        <Lock x={256} y={30} filled />
        <T x={270} y={34} c="h" a="start">trusted</T>
      </R>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────
   FIG. VI — the handshake, then the offload
   ───────────────────────────────────────────────────────────────── */

export function Handshake() {
  const C = 38;
  const L = 170;
  const M = 302;
  return (
    <svg viewBox="0 0 340 380" className="dg-svg" role="img" aria-label="Sequence diagram: ClientHello, ServerHello with the certificate and key share, both sides derive the same key, Finished. Then an encrypted GET reaches the LB, which decrypts it and forwards plain HTTP to a member; the response returns the same way.">
      <R at={0}>
        <Box x={4} y={6} w={68} h={28} />
        <T x={C} y={24} c="h">client</T>
        <Box x={122} y={6} w={96} h={28} />
        <T x={L} y={24} c="h">LB</T>
        <Box x={268} y={6} w={68} h={28} soft />
        <T x={M} y={24} c="h">member</T>
        <line x1={C} y1={34} x2={C} y2={372} className="dg-life" />
        <line x1={L} y1={34} x2={L} y2={372} className="dg-life" />
        <line x1={M} y1={34} x2={M} y2={372} className="dg-life" />
      </R>

      <R at={0.3}>
        <T x={104} y={58} c="t">ClientHello</T>
        <T x={104} y={70} c="s">SNI · key share</T>
        <Ar x1={C} y1={78} x2={L} y2={78} />
      </R>
      <R at={0.9}>
        <T x={104} y={102} c="t">ServerHello</T>
        <T x={104} y={114} c="s">cert chain · key share</T>
        <Ar x1={L} y1={122} x2={C} y2={122} />
      </R>
      <R at={1.5}>
        <circle cx={C} cy={148} r={6} className="dg-fill" />
        <circle cx={L} cy={148} r={6} className="dg-fill" />
        <T x={104} y={146} c="a">same key,</T>
        <T x={104} y={158} c="a">never sent</T>
      </R>
      <R at={2.0}>
        <T x={104} y={180} c="t">Finished</T>
        <Ar x1={C} y1={188} x2={L} y2={188} />
        <path d="M186 50 H192 V194 H186" className="dg-ln" fill="none" />
        <T x={200} y={112} c="h" a="start">handshake</T>
        <T x={200} y={126} c="s" a="start">one round trip</T>
        <T x={200} y={140} c="s" a="start">the member never</T>
        <T x={200} y={152} c="s" a="start">sees any of it</T>
      </R>

      <R at={2.6}>
        <T x={104} y={228} c="t">GET /cart</T>
        <Ar x1={C} y1={236} x2={L - 8} y2={236} strong />
      </R>
      <Mv at={2.6} dx={110} dur={0.8}>
        <rect x={142} y={231} width={14} height={10} rx={1.5} className="dg-fill" />
      </Mv>
      <R at={3.3}>
        <rect x={L - 7} y={224} width={14} height={26} rx={2} className="dg-fill" />
        <T x={L - 10} y={266} c="a" a="end">TLS ends here</T>
        <T x={236} y={228} c="t">GET /cart</T>
        <T x={236} y={252} c="s">plain HTTP</T>
        <Ar x1={L + 8} y1={236} x2={M} y2={236} dash />
      </R>
      <Mv at={3.3} dx={104} dur={0.8}>
        <rect x={282} y={231} width={14} height={10} rx={1.5} className="dg-box" />
      </Mv>

      <R at={4.1}>
        <T x={236} y={296} c="t">200 OK</T>
        <Ar x1={M} y1={304} x2={L + 8} y2={304} dash />
      </R>
      <R at={4.6}>
        <rect x={L - 7} y={292} width={14} height={24} rx={2} className="dg-fill" />
        <T x={104} y={338} c="t">200 OK</T>
        <Ar x1={L - 8} y1={346} x2={C} y2={346} strong />
        <Lock x={104} y={362} filled />
      </R>
    </svg>
  );
}
