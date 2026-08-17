import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ScriptaTopbar from "../../components/scripta/ScriptaTopbar";
import ScriptaFooter from "../../components/scripta/ScriptaFooter";
import ReadingProgress from "../../components/scripta/ReadingProgress";
import ArticleBody from "../../components/scripta/ArticleBody";
import Schematic from "../../components/scripta/Schematic";
import {
  getAllPosts,
  getPostBySlug,
  getAdjacentPosts,
  getToc,
  KIND_META,
  type SchematicKey,
} from "../content";

/** Generic hero caption per schematic — swap for per-post captions later. */
const HERO_CAPTION: Record<SchematicKey, string> = {
  tree: "The object graph — every node addressed by the hash of its own content.",
  p2p: "Two peers and a pipe — the server only ever brokers the introduction.",
  pipe: "One primitive, composed with itself, until the pipeline writes itself.",
  loop: "The loop, drawn honestly — sameness is the practice, not the tragedy.",
  cache: "Split, scope, cache — the same context, paid for exactly once.",
  graph: "Complexity fanned outward, toward the leaves, where it stays cheap.",
  ptr: "Budget ratio in, creature state out — *ptr lives on the number Cursor stopped showing.",
};

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found — Scripta" };
  return {
    title: `${post.title} — Scripta`,
    description: post.dek,
    openGraph: {
      title: post.title,
      description: post.dek,
      type: "article",
      publishedTime: post.isoDate,
      authors: ["Vedant Nagwanshi"],
      tags: post.tags,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const toc = getToc(post);
  const kind = KIND_META[post.kind];

  return (
    <>
      <ReadingProgress />

      <ScriptaTopbar
        crumb={
          <>
            <Link className="crumb-link" href="/scripta">
              Scripta
            </Link>
            &nbsp;/&nbsp;<b>{post.slug}</b>
          </>
        }
        folio={`IV · ${post.num}`}
      />

      <header className="head">
        <Link className="back" href="/scripta">
          ← Back to Scripta
        </Link>
        <div className="a-kicker">
          <span className="rn">{post.num}</span> {kind.latin}{" "}
          <span className="en">· {kind.en}</span>
        </div>
        <h1 className="a-title">{post.title}</h1>
        <p className="a-dek">{post.dek}</p>
        <div className="a-meta">
          <span>{post.date}</span>
          <span className="dot" />
          <span>{post.readTime} min read</span>
          {post.projectRef && (
            <>
              <span className="dot" />
              <span>{post.projectRef}</span>
            </>
          )}
          {(post.repo || post.crosspost?.medium || post.crosspost?.devto) && (
            <span className="a-links">
              {post.repo && (
                <a className="repo" href={post.repo} target="_blank" rel="noopener noreferrer">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 012-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  Repository
                </a>
              )}
              {post.crosspost?.medium && (
                <a href={post.crosspost.medium} target="_blank" rel="noopener noreferrer">
                  Medium ↗
                </a>
              )}
              {post.crosspost?.devto && (
                <a href={post.crosspost.devto} target="_blank" rel="noopener noreferrer">
                  dev.to ↗
                </a>
              )}
            </span>
          )}
        </div>
      </header>

      <figure className="figure">
        <div className={`frame${post.heroImage ? " frame-img" : ""}`}>
          {post.heroImage ? (
            post.heroImage.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.heroImage.src} alt={post.heroImage.alt} />
            ) : (
              <div className="imgph imgph-hero" role="img" aria-label={post.heroImage.alt}>
                <span className="imgph-mark">hero image</span>
                <span className="imgph-label">{post.heroImage.alt}</span>
              </div>
            )
          ) : (
            <Schematic name={post.schematic} size="lg" />
          )}
        </div>
        <figcaption className="figcap">
          {post.heroImage?.caption ?? HERO_CAPTION[post.schematic]}
        </figcaption>
      </figure>

      <div className="grid">
        {/* left rail — TOC + scroll-spy */}
        <aside className="rail">
          <div className="lbl">Contents</div>
          <ul className="toc" id="scripta-toc">
            {toc.map((t, i) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className={i === 0 ? "on" : undefined}>
                  <span className="rn">{t.rn}</span> {t.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* reading column */}
        <ArticleBody body={post.body} />

        {/* right marginalia */}
        <aside className="marg">
          <div className="stick">
            {(post.marginalia ?? []).map((m, i) => (
              <div className="note" key={i}>
                <span className="n">{m.label}</span>
                <p dangerouslySetInnerHTML={{ __html: m.html }} />
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* end matter */}
      <div className="end">
        <div className="filed">
          <span className="fl">Filed under</span>
          {post.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="byline">
          <span className="av">VN</span>
          <span>
            Written by <b>Vedant Nagwanshi</b>
            {post.crosspost?.medium || post.crosspost?.devto
              ? " — also on Medium & dev.to."
              : "."}
          </span>
        </div>
      </div>

      {/* prev / next */}
      <nav className="pn">
        {prev ? (
          <Link className="prev" href={`/scripta/${prev.slug}`}>
            <div className="dir">← Previous</div>
            <div className="pt">{prev.title}</div>
          </Link>
        ) : (
          <span className="prev empty-pn" />
        )}
        {next ? (
          <Link className="next" href={`/scripta/${next.slug}`}>
            <div className="dir">Next →</div>
            <div className="pt">{next.title}</div>
          </Link>
        ) : (
          <span className="next empty-pn" />
        )}
      </nav>

      <ScriptaFooter />
    </>
  );
}
