# Portfolio — Design & Aesthetic Guide

> A living document that defines the visual language, interaction philosophy, and design constraints for Vedant's portfolio. Every decision should pass through these filters.

---

## 1. Core Philosophy

**"Quiet confidence."**

Nothing screams. Nothing begs for attention. Everything feels *intentional*. The portfolio should feel like a well-designed tool — you don't notice how good it is until you compare it to something else. The craft is in the subtlety.

- **Minimalist, not empty** — Every element earns its place. White space is a design choice, not laziness.
- **Smooth, not flashy** — Animations exist to guide, not to impress. If someone notices an animation, it should feel satisfying, not distracting.
- **Interactive, not overwhelming** — Microinteractions reward curiosity without demanding it. The site works perfectly for someone who never hovers or scrolls creatively.
- **Experimental, not chaotic** — Push boundaries in *how* things move and feel, not in how much is on screen.

---

## 2. Color System

### Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Background** | White | `#FFFFFF` | Primary canvas, dominant color |
| **Primary Text** | Near-black | `#111111` | Headlines, body copy, primary content |
| **Secondary Text** | Mid-grey | `#777777` | Captions, labels, supporting text |
| **Muted** | Light grey | `#E5E5E5` | Borders, dividers, subtle UI elements |
| **Surface** | Off-white | `#FAFAFA` | Cards, elevated surfaces, hover states |
| **Accent** | Gunmetal Blue | `#2B3A4E` | CTAs, links, highlights, interactive focus states |
| **Accent Light** | Faded Gunmetal | `#2B3A4E` @ 10-15% opacity | Hover backgrounds, subtle highlights |

### Rules

- The page should feel **95% white/grey/black** at a glance.
- Gunmetal blue is used **sparingly** — only to draw the eye to one or two things at a time.
- Never use accent color for decoration. It always signals *"this is actionable"* or *"this is important"*.
- No gradients on UI elements. If gradients are used, they're environmental (e.g., a subtle ambient glow behind the 3D model).
- Dark mode is **not planned**. The identity is white.

---

## 3. Typography

### Fonts

- **Primary — JetBrains Mono** (`--font-jetbrains`) — The backbone. Used for headlines, body copy, and most text. Signals *"developer"* through typography itself. This is deliberate: a mono font as the primary face is an unconventional choice that gives the portfolio its identity.
- **Secondary — Space Grotesk** (`--font-space`) — Sharp, geometric sans-serif. Used for section titles, UI labels, navigation, and anywhere you want contrast against the mono. Feels professional and clean, balances the mono's density.

### Italics

Italics are a design tool here, not just emphasis:

- Use *Space Grotesk italic* for **pull quotes, philosophical asides, short descriptive phrases** — anywhere text should feel conversational or reflective. E.g., a subtitle like *"building things that feel right"*.
- Use *JetBrains Mono italic* sparingly for **inline emphasis** within body text — it has a distinctive slant that adds texture.
- Italics create a **third voice** alongside the two fonts. Use it to break rhythm intentionally.

### Scale & Hierarchy

| Element | Size | Weight | Font | Tracking | Notes |
|---------|------|--------|------|----------|-------|
| Hero headline | `clamp(3rem, 6vw, 5rem)` | 700 | JetBrains Mono | -0.03em (tight) | The biggest statement |
| Section title | `1.5rem – 2rem` | 600 | Space Grotesk | -0.02em | Clean contrast to mono body |
| Body text | `1rem – 1.125rem` | 400 | JetBrains Mono | -0.01em | Slightly tightened for readability |
| Subtitle / tagline | `1rem – 1.25rem` | 400 | Space Grotesk *italic* | normal | The conversational voice |
| Caption / label | `0.75rem – 0.875rem` | 500 | Space Grotesk | 0.08em (wide) | All-caps, wide-tracked |
| Nav links | `0.875rem` | 500 | Space Grotesk | 0.02em | Clean, scannable |
| Code / metadata | `0.8rem` | 400 | JetBrains Mono | normal | Tech stack, dates, etc. |

### Rules

- JetBrains Mono carries the content. Space Grotesk provides **structural contrast** (titles, labels, navigation).
- Headlines are **tight-tracked**, labels are **wide-tracked**, body is slightly tightened.
- No all-caps except for small labels/captions in Space Grotesk.
- Line heights: Headlines `1.1`, Body `1.65` (mono needs more breathing room), Captions `1.4`.
- When in doubt, set it in JetBrains Mono. Reach for Space Grotesk only when you need a different texture.
- Italics should feel like a whisper — never more than one or two instances visible on screen at a time.

---

## 4. Spacing & Layout

### Grid

- Max content width: `1200px`
- Horizontal padding: `2rem` (mobile) → `4rem` (desktop)
- Sections have generous vertical breathing room: `6rem – 10rem` between major sections.

### Rules

- **Asymmetry over symmetry** — Layouts don't need to be perfectly centered. Slight offsets feel more designed.
- **Generous whitespace** — When in doubt, add more space, not less.
- **No visible grid lines or containers** — Structure is implied through spacing, not boxes.
- Cards/surfaces use very subtle elevation: `box-shadow` with low opacity, or just a 1px border in `#E5E5E5`.

---

## 5. Motion & Animation

### Principles

1. **Enter from stillness** — Elements fade/slide in from rest. No bouncing, no overshoot.
2. **Ease out, not ease in** — Things arrive quickly and settle slowly. Use `cubic-bezier(0.16, 1, 0.3, 1)` or similar.
3. **Duration: 300ms–600ms** — Fast enough to feel responsive, slow enough to feel smooth. Nothing over 800ms.
4. **Stagger, don't swarm** — When multiple elements animate in, stagger by `60–100ms`. Never animate everything at once.
5. **Scroll-driven reveals** — Content fades + translates up as it enters the viewport. Subtle (10–20px translate, not 50px).

### Microinteractions

- **Hover states:** Subtle color shifts, gentle scale (`1.02`), or underline reveals. Never dramatic.
- **Cursor:** Default cursor. No custom cursors — they create friction.
- **3D model:** Gentle auto-rotate, user-controlled orbit. Slight scale on hover. Ambient glow responds subtly to interaction.
- **Links/buttons:** Gunmetal blue on hover/focus. Transition `150ms`.

### What to Avoid

- Parallax scrolling (feels dated)
- Typewriter text effects
- Particle systems or excessive WebGL
- Anything that makes the user wait

---

## 6. Component Patterns

### Navigation

- Fixed top, transparent/frosted glass (`backdrop-blur`).
- Logo left, links right. Simple.
- Navigation should almost disappear — it's infrastructure, not design.

### Hero Section

- Large headline + short subtext + 3D model.
- The 3D model is the *only* visual flourish in the hero. Text stays minimal.
- No hero image, no background video.

### Project/Work Cards

- Clean, image-first when possible.
- On hover: subtle lift + accent border or accent detail.
- Metadata (tech stack, year) in mono, small.

### About Section

- Conversational tone. Short paragraphs.
- Optional: a single photo, desaturated or with subtle treatment.

### Contact / Footer

- Minimal. Links to socials + email.
- No contact form unless needed later.

---

## 7. Interaction Philosophy

- **Reward exploration** — Easter eggs, subtle hover reveals, details that only careful observers notice.
- **Never punish passivity** — The site must look and work perfectly for someone who just scrolls straight through.
- **Progressive disclosure** — Show the minimum first. Let interaction reveal more.
- **Performance is a feature** — No layout shifts, no loading spinners visible for more than a frame, instant navigation.

---

## 8. Technical Constraints

| Constraint | Detail |
|-----------|--------|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| 3D | `@google/model-viewer` for GLB display |
| 3D (extended) | Three.js + R3F available if needed |
| Fonts | JetBrains Mono + Space Grotesk (via `next/font/google`) |
| Deployment | TBD |
| Browser support | Modern evergreen browsers |

---

## 9. Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-bg: #FFFFFF;
  --color-text: #111111;
  --color-text-secondary: #777777;
  --color-muted: #E5E5E5;
  --color-surface: #FAFAFA;
  --color-accent: #2B3A4E;
  --color-accent-light: rgba(43, 58, 78, 0.1);

  /* Typography */
  --font-primary: var(--font-jetbrains);   /* JetBrains Mono — body, headlines */
  --font-secondary: var(--font-space);     /* Space Grotesk — titles, labels, nav */
  --font-mono: var(--font-jetbrains);      /* Alias for code contexts */

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 600ms;

  /* Layout */
  --max-width: 1200px;
  --px-mobile: 2rem;
  --px-desktop: 4rem;
}
```

---

## 10. The Litmus Tests

Before adding any element or effect, ask:

1. **Does it serve the content?** If it's decoration for decoration's sake, cut it.
2. **Would I notice if it were removed?** If no, it's clutter.
3. **Does it feel smooth at 60fps?** If it janks, kill it or simplify it.
4. **Can I explain why it's here in one sentence?** If not, reconsider.
5. **Does it still feel good after the 10th visit?** Novelty wears off. Craft doesn't.

---

*This document evolves as the portfolio evolves. Update it when design decisions change.*
