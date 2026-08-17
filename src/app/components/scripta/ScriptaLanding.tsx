"use client";

import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import Link from "next/link";
import Schematic from "./Schematic";
import ScriptaTopbar from "./ScriptaTopbar";
import ScriptaFooter from "./ScriptaFooter";
import { KIND_META, type Kind, type SchematicKey } from "@/app/scripta/content";

export type LandingPost = {
  num: string;
  slug: string;
  kind: Kind;
  title: string;
  dek: string;
  date: string;
  year: string;
  readTime: number;
  tags: string[];
  schematic: SchematicKey;
};

const KIND_ORDER: Kind[] = ["fabrica", "ratio", "quaestio", "nota", "meditatio"];

/** Split `text` on the first case-insensitive occurrence of `q`, wrapping the
 *  match in <mark>. Returns React nodes — no dangerouslySetInnerHTML. */
function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <Fragment>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </Fragment>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export default function ScriptaLanding({ posts }: { posts: LandingPost[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind | "all">("all");
  const [year, setYear] = useState<string>("all");
  const [focused, setFocused] = useState(false);
  const [kindOpen, setKindOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<HTMLDivElement>(null);

  const years = useMemo(
    () => Array.from(new Set(posts.map((p) => p.year))).sort((a, b) => Number(b) - Number(a)),
    [posts]
  );
  const kindCount = useMemo(() => new Set(posts.map((p) => p.kind)).size, [posts]);
  const span = useMemo(() => {
    if (!years.length) return "—";
    const lo = years[years.length - 1];
    const hi = years[0];
    return lo === hi ? lo : `${lo}–${hi.slice(2)}`;
  }, [years]);

  const shown = useMemo(
    () =>
      posts.filter((p) => {
        if (kind !== "all" && p.kind !== kind) return false;
        if (year !== "all" && p.year !== year) return false;
        if (q) {
          const hay = `${p.title} ${p.dek} ${p.kind} ${p.tags.join(" ")}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [posts, kind, year, q]
  );

  // "/" focuses search from anywhere; Esc clears + blurs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setQ("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close the mobile Kind dropdown on outside click or Escape.
  useEffect(() => {
    if (!kindOpen) return;
    const onDown = (e: MouseEvent) => {
      if (kindRef.current && !kindRef.current.contains(e.target as Node)) {
        setKindOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setKindOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [kindOpen]);

  const clearAll = () => {
    setQ("");
    setKind("all");
    setYear("all");
  };

  const idle = !focused && q === "";

  return (
    <>
      <ScriptaTopbar
        crumb={
          <>
            <Link className="crumb-link" href="/">
              Portfolio
            </Link>
            &nbsp;&nbsp;/&nbsp;&nbsp;<b>Scripta</b>
          </>
        }
        folio="CXVIII / CX"
      />

      <header className="mast wrap">
        <div className="ghost">IV</div>
        <div className="kick">
          <span className="tick" /> IV &nbsp;·&nbsp; the written record
        </div>
        <h1 className="sec-title xlate">
          <span className="lt">Scripta</span>
          <span className="en">Writings</span>
        </h1>
        <div className="mast-foot">
          <p className="dek">
            notes from what i find interesting and things that i keep breaking :p
          </p>
          <div className="stats">
            <div>
              <span className="n">{pad2(posts.length)}</span>pieces
            </div>
            <div>
              <span className="n">{pad2(kindCount)}</span>kinds
            </div>
            <div>
              <span className="n">{span}</span>span
            </div>
          </div>
        </div>
      </header>

      <div className="controls">
        <div className="wrap">
          <div className={`prompt${focused ? " on" : ""}${idle ? " idle" : ""}`}>
            <span className="path">scripta ~/writings</span>
            <span className="caret">❯</span>
            <span className="blink" />
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="filter the record — title, topic, kind…"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search writings"
            />
            <span className="slash">press /</span>
          </div>

          <div className="filters">
            <div className="kind-group" ref={kindRef}>
              <span className="flabel">Kind</span>
              {/* Mobile-only toggle — collapses the chips into a dropdown */}
              <button
                type="button"
                className={`kind-toggle${kindOpen ? " open" : ""}`}
                aria-expanded={kindOpen}
                aria-label="Filter by kind"
                onClick={() => setKindOpen((o) => !o)}
              >
                <span>{kind === "all" ? "All" : KIND_META[kind].latin}</span>
                <svg
                  className="chev"
                  width="9"
                  height="9"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  aria-hidden="true"
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5" />
                </svg>
              </button>
              <div className={`kind-chips${kindOpen ? " open" : ""}`}>
                <button
                  className={`chip${kind === "all" ? " active" : ""}`}
                  onClick={() => {
                    setKind("all");
                    setKindOpen(false);
                  }}
                >
                  All
                </button>
                {KIND_ORDER.map((k) => (
                  <button
                    key={k}
                    className={`chip${kind === k ? " active" : ""}`}
                    onClick={() => {
                      setKind(k);
                      setKindOpen(false);
                    }}
                  >
                    {KIND_META[k].latin}
                    <span className="en">{KIND_META[k].en}</span>
                  </button>
                ))}
              </div>
            </div>
            <span className="sep" />
            <span className="flabel">Year</span>
            <button
              className={`chip${year === "all" ? " active" : ""}`}
              onClick={() => setYear("all")}
            >
              All
            </button>
            {years.map((y) => (
              <button
                key={y}
                className={`chip${year === y ? " active" : ""}`}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            ))}
            <span className="count">
              <b>{pad2(shown.length)}</b> / {pad2(posts.length)} pieces
            </span>
          </div>
        </div>
      </div>

      <main className="wrap">
        <section className="ledger">
          <div className="ledger-h">
            <div>№</div>
            <div>Kind</div>
            <div>Title</div>
            <div>Date</div>
            <div>Read</div>
            <div />
          </div>

          <div className="rows" key={`${kind}|${year}`}>
            {shown.map((p, i) => (
              <Link
                className="row"
                href={`/scripta/${p.slug}`}
                key={p.slug}
                style={{ animationDelay: `${Math.min(i * 60, 540)}ms` }}
              >
                <div className="r-num">{p.num}</div>
                <div className="r-cat">
                  {KIND_META[p.kind].latin}
                  <span className="en">{KIND_META[p.kind].en}</span>
                </div>
                <div className="r-body">
                  <div className="r-title">{highlight(p.title, q)}</div>
                  <span className="r-sub">{highlight(p.dek, q)}</span>
                  <div className="r-tags">
                    {p.tags.map((t) => (
                      <span
                        className="r-tag"
                        key={t}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQ(t);
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="r-glyph">
                    <Schematic name={p.schematic} size="sm" />
                    <span className="r-read">
                      Read the piece
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                        <path d="M3 9L9 3M9 3H4M9 3V8" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="r-date">{p.date}</div>
                <div className="r-time">{p.readTime} min</div>
                <div className="r-arr">→</div>
              </Link>
            ))}
          </div>

          <div className={`empty${shown.length === 0 ? " show" : ""}`}>
            <div className="big">Nothing in the record matches.</div>
            <div>Loosen the filters, or search a broader term.</div>
            <button onClick={clearAll}>Clear filters</button>
          </div>
        </section>
      </main>

      <ScriptaFooter />
    </>
  );
}
