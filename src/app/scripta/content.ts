/* ═══════════════════════════════════════════════════════════════════
   Scripta — content layer
   Single source of truth for all writings. Structured as typed data so
   the whole section (homepage preview, /scripta index, /scripta/[slug])
   renders from one place. Swap this for an MDX pipeline later without
   touching the UI — the Post shape is the contract.
   ═══════════════════════════════════════════════════════════════════ */

export type Kind = "fabrica" | "ratio" | "quaestio" | "nota" | "meditatio";

export const KIND_META: Record<Kind, { latin: string; en: string }> = {
  fabrica: { latin: "Fabrica", en: "build" },
  ratio: { latin: "Ratio", en: "method" },
  quaestio: { latin: "Quaestio", en: "inquiry" },
  nota: { latin: "Nota", en: "note" },
  meditatio: { latin: "Meditatio", en: "essay" },
};

/* ── Body block model ──
 * Mirrors what an MDX renderer would emit. `html` fields carry authored,
 * trusted markup (inline <code>, <strong>, <em>, <a class="link">). */
export type Block =
  | { type: "p"; html: string }
  | { type: "h2"; id: string; rn: string; text: string }
  | { type: "code"; cap?: string; html: string }
  | { type: "pull"; text: string }
  | { type: "figure"; schematic: SchematicKey; caption?: string }
  /* Photo/illustration slot. Drop a file under /public and set `src`
   * (e.g. "/scripta/ptr/moods.png"). Until then it renders as a labelled
   * placeholder frame so the layout is finished but the gap is obvious. */
  | { type: "image"; src?: string; alt: string; caption?: string; label?: string }
  /* Small multiples — a set of images in a grid (e.g. sketchbook pages). */
  | { type: "gallery"; caption?: string; images: { src: string; alt: string }[] };

export type Marginalia = { label: string; html: string };

export type SchematicKey =
  | "tree"
  | "p2p"
  | "pipe"
  | "loop"
  | "cache"
  | "graph"
  | "ptr";

export type Post = {
  num: string; // zero-padded ledger number, newest = highest
  slug: string;
  kind: Kind;
  title: string;
  dek: string; // one/two-sentence subtitle, shown on row + article header
  date: string; // display form, e.g. "MAR 2026"
  isoDate: string; // machine date for <time> / OG
  year: string;
  readTime: number; // minutes
  tags: string[];
  schematic: SchematicKey; // ledger-row glyph (always present)
  heroImage?: { src?: string; alt: string; caption?: string }; // hero photo; falls back to `schematic` when absent
  projectRef?: string; // small meta line, e.g. "ts_git · npm 02_git"
  repo?: string; // source repository URL — surfaced as a GitHub link in the header
  crosspost?: { medium?: string; devto?: string };
  draft?: boolean;
  body: Block[];
  marginalia?: Marginalia[];
};

/* Roman numerals for TOC / h2 kickers (1-indexed). */
const RN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

/* Helper to build an h2 block with a stable id + roman numeral. */
function h2(index: number, id: string, text: string): Block {
  return { type: "h2", id, rn: RN[index], text };
}

/* ═══════════════════════════════════════════════════════════════════
   The record
   ═══════════════════════════════════════════════════════════════════ */

export const posts: Post[] = [
  {
    num: "01",
    slug: "ptr-a-pointer-to-your-cursor-indulgence",
    kind: "fabrica",
    title: "*ptr — a pointer to your Cursor indulgence",
    dek: "Cursor hid the one number that kept me honest — my dollar usage. So I built a little creature that lives on it, and dies if I overspend.",
    date: "AUG 2026",
    isoDate: "2026-08-13",
    year: "2026",
    readTime: 5,
    tags: ["cursor", "llm", "browser-extension"],
    schematic: "ptr",
    projectRef: "*ptr · cursor extension",
    repo: "https://github.com/02-davinci-01/_ptr",
    heroImage: {
      src: "/scripta/ptr/moods.png",
      alt: "*ptr in its seven moods — chill, happy, mid, sad, angry, sick, and the null-ptr dead state, each mapped to a budget ratio.",
      caption: "Budget ratio in, mood out — from chill (B-)) all the way down to the null-ptr ghost.",
    },
    body: [
      h2(0, "s1", "Premise"),
      {
        type: "p",
        html: "A long time ago (a month ago, that is), I was tasked with delivering a gargantuan task (to create a replica of AWS Lambda) in the mere span of 14 days. And, just like any rational person, I cranked the model up to the Anthropic family and began. My struggles and plight while building the new module deserve another article (hopefully soon enough), but I was confronted by a much more sinister and sneakier problem — my Cursor usage.",
      },
      h2(1, "s2", "The Cursor curse"),
      {
        type: "p",
        html: "Ever since the advancement of AI models, agentic coding has been the norm. And I'm no godlike entity to write code by hand. But with agentic coding comes the API cost. Now, up until a few months prior, Cursor's usage tab (in the enterprise team plan) — like a good, reasonable service — showcased my general liability score to the company, i.e. my dollar usage. And that kept me reasonably in check and let me plan accordingly. But due to some wicked, ill-thought sorcery, the very arbiter keeping me in check was stripped of the one entity that made me reconsider my career choices — the dollar usage I burn through. All I was left with was the % API usage and % plan usage. Which, granted, are data in and of themselves, but not as clear nor as fearsome to look at. For what good is a 100% API stat if I can still run the best models seamlessly? (I was burning through the team pool.)",
      },
      h2(2, "s3", "The exorcism and aftermath"),
      {
        type: "p",
        html: "The amount of dollars consumed by each team member was showcased only to the TLs and managers, which meant multiple reminders from their end that I'm costing the company way more than my utility (ouch). Then I regained my lost IQ points through a miracle of God and realised that all my agentic workflows were using MAX mode by default, due to a misconfigured md file 😃😃. I fixed it and — voila! — I was no longer a credit-burning machine. But the very experience instilled a need for some form of monetary monitoring (intended alliteration) for my overall Cursor usage. And that's how *ptr (pointer, that is) was born.",
      },
      h2(3, "s4", "*ptr"),
      {
        type: "p",
        html: "I made pointer to solve the two problems that I had with Cursor: I couldn't see my dollar usage, and the usage page itself was unappealing (just like seeing your bank balance towards the end of the month).",
      },
      {
        type: "image",
        src: "/scripta/ptr/dashboard.jpg",
        alt: "The *ptr dashboard showing dollar usage against a monthly budget, first- vs third-party split, an end-of-month projection, and a weekly spend chart.",
        label: "*ptr dashboard — usage, projection, budget",
        caption: "The numbers Cursor stopped showing — dollar usage, an end-of-month projection, and your budget goal.",
      },
      {
        type: "p",
        html: "*ptr works on a simple mechanism, really. It just uses the data that Cursor was already sending over its network (but which somehow the UI was too shy to show), and uses the stored application cookie in your browser to access it. Along with that, it has projection and budget-setting capabilities — i.e. if you want to be more economical and less of a liability to a company, you can set a budget and track the projected end of the month.",
      },
      {
        type: "p",
        html: "The only downside is the refreshing of the token in case of logout — although that can be solved by hitting the cURL with your creds, but then it kind of falters for Google sign-in.",
      },
      {
        type: "p",
        html: "To make the data less jarring, I made my own little entity, *ptr (a bad pun on cursor, honestly). You can pet him, and his mood changes depending on your discipline. As you indulge, he suffers, and finally dies if you exceed the budget — how poetic.",
      },
      {
        type: "image",
        src: "/scripta/ptr/nullptr.jpg",
        alt: 'The null-ptr dead state — *ptr faded into smoke with a calm little smile, a speech bubble reading "I am a null ptr :P".',
        label: "the null-ptr (dead) state",
        caption: 'Overshoot the budget and *ptr goes null — fading into smoke with an eerie little smile: "I am a null ptr :P".',
      },
      {
        type: "p",
        html: "That's really pretty much the reason for making this little extension. I have <a class=\"link\" href=\"https://github.com/02-davinci-01/_ptr\" target=\"_blank\" rel=\"noopener noreferrer\">uploaded the binary and the relevant JS on GitHub</a>, so perhaps you can extend it and make your own.",
      },
      {
        type: "p",
        html: "Have fun with *ptr, and try not to get him killed :p",
      },
      h2(4, "s5", "From the sketchbook"),
      {
        type: "p",
        html: "Before any of it was code, *ptr was just a face I kept redrawing in the margins — figuring out whether he needed a mouth, how he should die, and which budget ratio mapped to which mood.",
      },
      {
        type: "gallery",
        caption: "Early *ptr — deciding on a face, a ghost, and the chill → happy → sick → dead → null-ptr ladder.",
        images: [
          { src: "/scripta/ptr/sketch-1.jpg", alt: "Notebook sketches of *ptr's triangular body and first face iterations." },
          { src: "/scripta/ptr/sketch-2.jpg", alt: "Sketches exploring *ptr as a ghost and whether it needs a mouth or expresses through eyes." },
          { src: "/scripta/ptr/sketch-3.jpg", alt: "The mood-ladder sketch: chill → happy → mid → angry → sick → dead → null ptr, 'a pointer to your cursor indulgence'." },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Query helpers
   ═══════════════════════════════════════════════════════════════════ */

const isPublished = (p: Post) => !p.draft || process.env.NODE_ENV !== "production";

/** All published posts, newest first (highest num). */
export function getAllPosts(): Post[] {
  return posts
    .filter(isPublished)
    .slice()
    .sort((a, b) => Number(b.num) - Number(a.num));
}

export function getPostBySlug(slug: string): Post | null {
  const p = posts.find((x) => x.slug === slug);
  if (!p || !isPublished(p)) return null;
  return p;
}

/** Prev = older, next = newer — matches reading order in the ledger. */
export function getAdjacentPosts(slug: string): { prev: Post | null; next: Post | null } {
  const all = getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return { prev: all[i + 1] ?? null, next: all[i - 1] ?? null };
}

/** Distinct years present, newest first — for the year filter chips. */
export function getYears(): string[] {
  return Array.from(new Set(getAllPosts().map((p) => p.year))).sort((a, b) => Number(b) - Number(a));
}

/** TOC entries (h2 blocks) for an article. */
export function getToc(post: Post): { id: string; rn: string; text: string }[] {
  return post.body
    .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
    .map(({ id, rn, text }) => ({ id, rn, text }));
}
