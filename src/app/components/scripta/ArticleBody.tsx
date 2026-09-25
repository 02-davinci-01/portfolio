import { Fragment } from "react";
import Schematic from "./Schematic";
import Diagram from "./Diagram";
import type { Block } from "@/app/scripta/content";

/**
 * Renders the article block model into the reading column. `html` fields carry
 * trusted, authored markup (from content.ts) — the MDX-equivalent output — so
 * dangerouslySetInnerHTML here is intentional, not user input.
 */
export default function ArticleBody({ body }: { body: Block[] }) {
  return (
    <article className="article">
      {body.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 id={block.id} key={i}>
                <span className="rn">{block.rn}</span>
                {block.text}
              </h2>
            );
          case "p":
            return <p key={i} dangerouslySetInnerHTML={{ __html: block.html }} />;
          case "pull":
            return (
              <div className="pull" key={i}>
                {block.text}
              </div>
            );
          case "code":
            return (
              <div className="code" key={i}>
                {block.cap && <span className="cap">{block.cap}</span>}
                <span dangerouslySetInnerHTML={{ __html: block.html }} />
              </div>
            );
          case "figure":
            return (
              <div className="infig" key={i}>
                <Schematic name={block.schematic} size="sm" />
                {block.caption && <div className="figcap">{block.caption}</div>}
              </div>
            );
          case "image":
            return (
              <figure className="imgfig" key={i}>
                {block.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={block.src} alt={block.alt} loading="lazy" />
                ) : (
                  <div className="imgph" role="img" aria-label={block.alt}>
                    <span className="imgph-mark">image</span>
                    {block.label && <span className="imgph-label">{block.label}</span>}
                  </div>
                )}
                {block.caption && <figcaption className="figcap">{block.caption}</figcaption>}
              </figure>
            );
          case "gallery":
            return (
              <figure className={`galfig${block.mono ? " mono" : ""}`} key={i}>
                <div className="galgrid">
                  {block.images.map((im, j) => (
                    <div className="galitem" key={j}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={im.src} alt={im.alt} loading="lazy" />
                      <span className="galno" aria-hidden="true">
                        p. {String(j + 1).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
                {block.caption && <figcaption className="figcap">{block.caption}</figcaption>}
              </figure>
            );
          case "defs":
            return (
              <dl className="defs" key={i}>
                {block.items.map((d) => (
                  <Fragment key={d.term}>
                    <dt>{d.term}</dt>
                    <dd dangerouslySetInnerHTML={{ __html: d.html }} />
                  </Fragment>
                ))}
              </dl>
            );
          case "theorem":
            return (
              <aside className="thm" key={i}>
                <div className="thm-k">{block.kicker}</div>
                <div className="thm-n">{block.name}</div>
                <div className="thm-s" dangerouslySetInnerHTML={{ __html: block.statement }} />
                {block.html && <p className="thm-p" dangerouslySetInnerHTML={{ __html: block.html }} />}
                {block.example && (
                  <div className="thm-ex">
                    <span className="thm-exl">e.g.</span>
                    <span dangerouslySetInnerHTML={{ __html: block.example }} />
                  </div>
                )}
              </aside>
            );
          case "math":
            return (
              <details className="mathbox" key={i} open={block.open}>
                <summary>
                  <span className="mb-t">{block.title}</span>
                  {block.summary && <span className="mb-s">{block.summary}</span>}
                  <span className="mb-chev" aria-hidden="true" />
                </summary>
                <div className="mb-body">
                  {block.rows.map((row, j) =>
                    "sec" in row ? (
                      <div className="mb-sec" key={j}>
                        {row.sec}
                      </div>
                    ) : (
                      <div className={`mb-row${row.key ? " key" : ""}`} key={j}>
                        <span className="mb-who">{row.who}</span>
                        <span className="mb-eq">
                          <span className="mb-expr" dangerouslySetInnerHTML={{ __html: row.expr }} />
                          {row.work && <span className="mb-work" dangerouslySetInnerHTML={{ __html: row.work }} />}
                        </span>
                        {row.val && <span className="mb-val">{row.val}</span>}
                      </div>
                    ),
                  )}
                  {block.foot && <p className="mb-foot" dangerouslySetInnerHTML={{ __html: block.foot }} />}
                </div>
              </details>
            );
          case "diagram":
            return <Diagram key={i} name={block.name} fig={block.fig} caption={block.caption} />;
          default:
            return <Fragment key={i} />;
        }
      })}
    </article>
  );
}
