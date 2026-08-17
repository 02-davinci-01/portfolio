import { Fragment } from "react";
import Schematic from "./Schematic";
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
              <figure className="galfig" key={i}>
                <div className="galgrid">
                  {block.images.map((im, j) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={j} src={im.src} alt={im.alt} loading="lazy" />
                  ))}
                </div>
                {block.caption && <figcaption className="figcap">{block.caption}</figcaption>}
              </figure>
            );
          default:
            return <Fragment key={i} />;
        }
      })}
    </article>
  );
}
