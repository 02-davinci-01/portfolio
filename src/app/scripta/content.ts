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
  /* `mono` renders the set in black & white (notebook scans on the site's palette). */
  | { type: "gallery"; caption?: string; mono?: boolean; images: { src: string; alt: string }[] }
  /* Glossary — term / definition pairs. */
  | { type: "defs"; items: { term: string; html: string }[] }
  /* A named theorem, boxed — statement, a line of context, a tiny example. */
  | { type: "theorem"; kicker: string; name: string; statement: string; html?: string; example?: string }
  /* Collapsible worked example. Rows are either a section label or one
   * step: who does it, the expression, the arithmetic, and the result. */
  | { type: "math"; title: string; summary?: string; open?: boolean; rows: MathRow[]; foot?: string }
  /* Hand-built SVG diagram (static or animated) — see Diagram.tsx. */
  | { type: "diagram"; name: DiagramKey; fig: string; caption?: string };

export type MathRow =
  | { sec: string }
  | { who?: string; expr: string; work?: string; val?: string; key?: boolean };

export type DiagramKey = "offload" | "paint" | "mitm" | "signature" | "chain" | "handshake";

export type Marginalia = { label: string; html: string };

export type SchematicKey =
  | "tree"
  | "p2p"
  | "pipe"
  | "loop"
  | "cache"
  | "graph"
  | "ptr"
  | "tls";

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
  heroDiagram?: { name: DiagramKey; caption?: string }; // animated hero diagram; takes precedence over heroImage
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

/* Inline link to an external visualiser. Leave the URL empty and it renders
 * as a dashed "soon" placeholder instead of a dead link — fill it in later. */
function vis(url: string, text: string): string {
  return url
    ? `<a class="link" href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
    : `<a class="link ph" aria-disabled="true" title="Link coming soon">${text}</a>`;
}

/* Visualiser links for the TLS piece — paste the URLs here when they're live. */
const TLS_LINKS = {
  diffieHellman: "https://tls-world.vercel.app/",
  eulerProof: "https://en.wikipedia.org/wiki/Euler%27s_theorem#Proofs",
  certChain: "https://tls-world.vercel.app/",
};

/* ═══════════════════════════════════════════════════════════════════
   The record
   ═══════════════════════════════════════════════════════════════════ */

export const posts: Post[] = [
  {
    num: "02",
    slug: "tls-offloading-by-a-dummy",
    kind: "ratio",
    title: "TLS offloading by a dummy",
    dek: "An LB is a lifeboat for requests. But before it can steer them anywhere, it has to speak their language — a dummy's tour of Diffie–Hellman, RSA, and certificates, i.e. how the S in HTTPS actually works.",
    date: "SEP 2026",
    isoDate: "2026-09-25",
    year: "2026",
    readTime: 7,
    tags: ["tls", "openstack", "cryptography"],
    schematic: "tls",
    projectRef: "Octavia · TLS offloading",
    heroDiagram: {
      name: "offload",
      caption: "TLS offloading — encryption ends at the lifeboat; the members behind it only ever see plain HTTP.",
    },
    body: [
      h2(0, "s1", "LB stands for Life Boat"),
      {
        type: "p",
        html: "I mean, ofc not literally (duh). But I often like to imagine an LB as a <strong>lifeboat for my requests</strong>: to which island (i.e. server) it should be directed, whether the weather is stormy or not (health monitors), or if there is no island left after all (bad gateway).",
      },
      {
        type: "p",
        html: "In a nutshell, a load balancer balances load (genius). But there are some terms to keep in mind that helped me sound educated enough :p. They are as follows:",
      },
      {
        type: "defs",
        items: [
          { term: "Octavia", html: "Used for providing the load-balancing service." },
          { term: "Barbican", html: "Stores secrets, i.e. keys." },
          { term: "Neutron", html: "The networking service from OpenStack. Responsible for subnets and security groups." },
          { term: "Amphora", html: "Octavia's default way of implementing a load balancer. It boots a small VM running HAProxy." },
          { term: "Keystone", html: "Identity / auth token service." },
        ],
      },
      {
        type: "p",
        html: "A good thing to keep in mind is that <mark>a load balancer is a specific function that a proxy can perform. A reverse proxy is a role.</mark>",
      },
      {
        type: "p",
        html: "Now, these are mostly jargon. But then, jargon sells. The key idea that I kept in mind while building TLS offloading is that <mark>the LB is a lifeboat with desperate requests on it, trying to reach their server</mark>.",
      },
      { type: "pull", text: "Now the question was: how would my lifeboat know where to lead these requests?" },

      h2(1, "s2", "If you know, you know"),
      {
        type: "p",
        html: `Before we actually get into TLS offloading, we need to understand a very pretty idea: the <strong>Diffie–Hellman</strong> algo. I have created a visualisation for it that you can find ${vis(TLS_LINKS.diffieHellman, "here")}. It has some really beautiful mathematics that allows us to <mark>telepathically agree on a key</mark>. A basic version of it is here:`,
      },
      {
        type: "diagram",
        name: "paint",
        fig: "FIG. II",
        caption: "Diffie–Hellman as paint: mixing is easy, un-mixing is not — so both sides end up with the same colour, and it never once crossed the wire.",
      },
      {
        type: "math",
        title: "The maths, gently",
        summary: "p = 23, g = 5 — two strangers, one secret",
        rows: [
          { sec: "public · everyone sees this" },
          { who: "both", expr: "<i>p</i> = 23, <i>g</i> = 5", work: "a prime, and a base" },
          { sec: "private · never leaves home" },
          { who: "alice", expr: "picks <i>a</i> = 4" },
          { who: "bob", expr: "picks <i>b</i> = 3" },
          { sec: "exchange · sent in the open" },
          { who: "alice", expr: "<i>A</i> = <i>g</i><sup><i>a</i></sup> mod <i>p</i>", work: "5<sup>4</sup> mod 23 = 625 mod 23", val: "4" },
          { who: "bob", expr: "<i>B</i> = <i>g</i><sup><i>b</i></sup> mod <i>p</i>", work: "5<sup>3</sup> mod 23 = 125 mod 23", val: "10" },
          { sec: "shared secret · computed, never sent" },
          { who: "alice", expr: "<i>s</i> = <i>B</i><sup><i>a</i></sup> mod <i>p</i>", work: "10<sup>4</sup> mod 23 = 10000 mod 23", val: "18", key: true },
          { who: "bob", expr: "<i>s</i> = <i>A</i><sup><i>b</i></sup> mod <i>p</i>", work: "4<sup>3</sup> mod 23 = 64 mod 23", val: "18", key: true },
        ],
        foot: "Why they match: <i>B</i><sup><i>a</i></sup> = (<i>g</i><sup><i>b</i></sup>)<sup><i>a</i></sup> = <i>g</i><sup><i>ab</i></sup> = (<i>g</i><sup><i>a</i></sup>)<sup><i>b</i></sup> = <i>A</i><sup><i>b</i></sup> (mod <i>p</i>). An eavesdropper sees <i>p</i>, <i>g</i>, <i>A</i> and <i>B</i> — getting <i>s</i> means digging <i>a</i> or <i>b</i> back out (the discrete log problem). Trivial for 23. Hopeless for a 2048-bit <i>p</i>.",
      },
      {
        type: "p",
        html: "The key idea to keep in mind is that <mark>Diffie–Hellman solves the problem of encrypting data, and not identity</mark>. A person in the middle (called the <strong>man in the middle</strong>) can impersonate the server you are talking to. And just like any other situationship, there is no way to know what you mean to the person :p",
      },
      {
        type: "diagram",
        name: "mitm",
        fig: "FIG. III",
        caption: "DH will happily complete two handshakes — one with you, one with the server. It hands you a secret, not a name.",
      },

      h2(2, "s3", "RSA: Real Shit Algorithm"),
      {
        type: "p",
        html: "One of the most gratifying experiences I had was learning about the RSA algorithm (and no, its full form is not Real Shit. It's Rivest–Shamir–Adleman). It's an <strong>asymmetric</strong> encryption algorithm that allows our browser to verify the certificate and the certificate chain, and <mark>ultimately solves the problem of identity</mark>.",
      },
      { type: "p", html: "RSA relies on a very beautiful theorem by Euler:" },
      {
        type: "theorem",
        kicker: "Theorem",
        name: "Euler's theorem",
        statement: "if gcd(<i>m</i>, <i>n</i>) = 1, then <i>m</i><sup>φ(<i>n</i>)</sup> ≡ 1 (mod <i>n</i>)",
        html: "φ(<i>n</i>) counts the numbers below <i>n</i> that share no factor with it. For an <i>n</i> = <i>p</i>·<i>q</i> built from two primes, that's simply (<i>p</i> − 1)(<i>q</i> − 1).",
        example: "n = 10 → φ(10) = 4 {1, 3, 7, 9} → 3<sup>4</sup> = 81 = 8·10 + 1 ≡ 1 (mod 10)",
      },
      {
        type: "p",
        html: `You can check out the proof ${vis(TLS_LINKS.eulerProof, "here")}. But this very idea — <mark>being able to decrypt a hash signed by a private key, and then individually compare and verify the hash</mark> — is the very foundation of TLS.`,
      },
      {
        type: "diagram",
        name: "signature",
        fig: "FIG. IV",
        caption: "Hash it, sign the hash with the private key — and anyone holding the public key can check the two hashes match.",
      },
      { type: "p", html: "I have added a simple derivation of how RSA works below." },
      {
        type: "math",
        title: "RSA, derived with tiny numbers",
        summary: "p = 3, q = 11 — keys, encrypt, decrypt, sign",
        rows: [
          { sec: "1 · make the keys" },
          { who: "pick", expr: "<i>p</i> = 3, <i>q</i> = 11", work: "two primes — kept secret" },
          { expr: "<i>n</i> = <i>pq</i>", work: "public", val: "33" },
          { expr: "φ(<i>n</i>) = (<i>p</i> − 1)(<i>q</i> − 1)", work: "= <i>pq</i> − <i>p</i> − <i>q</i> + 1 = 2 · 10", val: "20" },
          { who: "public", expr: "<i>e</i>: 1 &lt; <i>e</i> &lt; φ(<i>n</i>), gcd(<i>e</i>, φ(<i>n</i>)) = 1", work: "shares no factor with 20", val: "7" },
          { who: "private", expr: "<i>d</i>: <i>e</i>·<i>d</i> ≡ 1 (mod φ(<i>n</i>))", work: "7 · 3 = 21 = 20 + 1", val: "3" },
          { sec: "2 · encrypt & decrypt" },
          { who: "encrypt", expr: "<i>c</i> = <i>m</i><sup><i>e</i></sup> mod <i>n</i>", work: "<i>m</i> = 4 → 4<sup>7</sup> mod 33 = 16384 mod 33", val: "16" },
          { who: "decrypt", expr: "<i>m</i> = <i>c</i><sup><i>d</i></sup> mod <i>n</i>", work: "16<sup>3</sup> mod 33 = 4096 mod 33", val: "4 ✓", key: true },
          { sec: "3 · why it works" },
          { expr: "<i>c</i><sup><i>d</i></sup> = (<i>m</i><sup><i>e</i></sup>)<sup><i>d</i></sup> = <i>m</i><sup><i>ed</i></sup>" },
          { expr: "<i>ed</i> = 1 + <i>k</i>·φ(<i>n</i>)", work: "that's exactly how <i>d</i> was picked" },
          { expr: "<i>m</i><sup><i>ed</i></sup> = <i>m</i> · (<i>m</i><sup>φ(<i>n</i>)</sup>)<sup><i>k</i></sup> ≡ <i>m</i> · 1<sup><i>k</i></sup> = <i>m</i> (mod <i>n</i>)", work: "Euler: <i>m</i><sup>φ(<i>n</i>)</sup> ≡ 1", key: true },
          { sec: "4 · flip it around → a signature" },
          { who: "sign", expr: "sig = <i>h</i><sup><i>d</i></sup> mod <i>n</i>", work: "hash <i>h</i> = 5 → 5<sup>3</sup> mod 33 = 125 mod 33 · only the private key can", val: "26" },
          { who: "verify", expr: "sig<sup><i>e</i></sup> mod <i>n</i>", work: "26<sup>7</sup> mod 33 · anyone with the public key can", val: "5 = h ✓", key: true },
        ],
        foot: "Toy numbers, obviously — real keys use primes hundreds of digits long, which is what makes factoring <i>n</i> back into <i>p</i> and <i>q</i> hopeless. (Strictly, Euler needs gcd(<i>m</i>, <i>n</i>) = 1; the result holds for every <i>m</i> anyway — that bit's in the proof.)",
      },

      h2(3, "s4", "Give me a certificate"),
      {
        type: "p",
        html: "I think I deserve a certificate for writing this article and making the visualiser, if I'm being honest. And so thinks every domain on the internet. Think of a certificate as your Aadhaar card. And you only trust an Aadhaar card because it is signed by the Government of India (or whoever signs that white plastic). CA certs work the same way: <mark>a chain of trust and validity which, if broken at any point, is easily detectable</mark> (due to our beloved RSA), and moreover prevents the man-in-the-middle attack (and situationships and identity crises).",
      },
      {
        type: "p",
        html: `For a better visualisation of the chain, you can visit ${vis(TLS_LINKS.certChain, "my visualiser")} (cool stuff onli).`,
      },
      {
        type: "diagram",
        name: "chain",
        fig: "FIG. V",
        caption: "Checking starts from the bottom up — each signature is verified with its issuer's public key, until you reach a root your browser already trusts.",
      },

      h2(4, "s5", "The final rescue"),
      {
        type: "p",
        html: "Once the TLS handshake is done and the DH keys are exchanged, our humans (requests) are able to talk to the lifeboat (LB) and can inform it where they want to be headed. <mark>Finally, they have a common language</mark>, and voila — my requests are saved.",
      },
      {
        type: "diagram",
        name: "handshake",
        fig: "FIG. VI",
        caption: "One round trip of handshake; after that the LB decrypts, picks a member, and forwards plain HTTP. That's the offloading.",
      },
      {
        type: "p",
        html: "Honestly, it was one of the more interesting pieces of work that I had the fortune of implementing, and more importantly, I got a much deeper understanding of <mark>how the S in HTTPS actually works</mark>. Super fun stuff. I highly recommend you check it out and play around with it on your own.",
      },

      h2(5, "s6", "Scratchpad"),
      {
        type: "p",
        html: "As usual with anything I make, a lot of pages were filled with ideation, proofs, and wrapping my head around stuff. A couple of pages from that.",
      },
      {
        type: "gallery",
        mono: true,
        caption: "From the notebook — the outline, paint mixing, Diffie–Hellman, the RSA derivation, and the certificate chain.",
        images: [
          { src: "/scripta/tls/scratch-1.jpg", alt: "Notebook outline for this article: LB as a lifeboat, if you know you know, why I don't have a certificate, RSA, my guides, photos." },
          { src: "/scripta/tls/scratch-2.jpg", alt: "Paint-mixing sketch of the encryption technique (B+Y, Y+O, Y+O+B) and the Diffie–Hellman public values g^a mod p and g^b mod p." },
          { src: "/scripta/tls/scratch-3.jpg", alt: "Working out the Diffie–Hellman shared secret, then the RSA setup: n = pq, φ(n) = (p−1)(q−1), e = 17, ed ≡ 1 mod φ(n)." },
          { src: "/scripta/tls/scratch-4.jpg", alt: "The RSA derivation: C = M^e mod n, M = C^d mod n, and φ(n) expanded as pq − p − q + 1." },
          { src: "/scripta/tls/scratch-5.jpg", alt: "A GitHub certificate as data plus a signature made with the CA's private key, the root CA, and 'check starts from bottom up'." },
        ],
      },
    ],
  },
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
