# GSAP + Lenis — Execution Plan

> The concrete, trackable implementation plan. Each batch is independently shippable.
> Update status after every session.

---

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Done

---

## Phase 0 — Foundation ✅

> Completed. Non-destructive base layer.

- [x] Install `gsap`, `@gsap/react`, `lenis`
- [x] Create `src/app/lib/gsap.ts` — centralised plugin registration + global defaults
- [x] Create `src/app/components/SmoothScroll.tsx` — Lenis provider synced to GSAP ticker
- [x] Mount `SmoothScroll` in `layout.tsx`
- [x] Verify smooth scrolling, anchor nav, no model-viewer conflicts

---

## Batch A — Hero Exit + Scroll Indicator Fade

> First thing you scroll past. Immediately validates the investment.

### A1. Hero text parallax-out

**What:** As user scrolls past the hero section, the hero text group (tagline, name, quote) fades out + drifts upward. Scrubbed to scroll position.

**Spec:**
- Target: `.hero-text` wrapper (the `div.relative.z-10.max-w-2xl`)
- Effect: `y: -50`, `opacity: 0`
- ScrollTrigger: `trigger: hero section`, `start: "top top"`, `end: "bottom 60%"`, `scrub: 0.5`
- The statue (StatueViewer) lingers slightly longer — its own ScrollTrigger fades it at `end: "bottom 40%"`
- Mobile: same effect, lighter values (`y: -30`)

**Litmus:** Guides eye from hero to next section naturally. Noticeable if removed. 60fps.

- [ ] Add `ref` to hero text wrapper
- [ ] Add `ref` to statue wrapper
- [ ] Create `useGSAP` block with hero parallax-out ScrollTrigger
- [ ] Create statue fade ScrollTrigger (subtle `opacity: 0`, `scale: 0.97`)
- [ ] Test on desktop + mobile
- [ ] Verify StatueViewer hover still works during scroll

### A2. Scroll indicator exit

**What:** The "Scroll" indicator pill fades to 0 quickly as soon as the user scrolls even a little. Currently it just rides off-screen.

**Spec:**
- Target: scroll indicator wrapper
- Effect: `opacity: 0`, `y: -10`
- ScrollTrigger: `trigger: hero section`, `start: "top top"`, `end: "5% top"`, `scrub: true`
- Separate from hero text — this one disappears *fast*

**Litmus:** Functional polish. Did its job, now it vanishes. Respects attention.

- [ ] Add `ref` to scroll indicator
- [ ] Add ScrollTrigger for quick fade-out
- [ ] Remove `RevealOnScroll` wrapper from scroll indicator (now managed by GSAP)

---

## Batch B — Timeline Line Draw + Divider Lines

> The "wow" moment plus structural polish.

### B1. Iter timeline line draw (scroll-scrubbed)

**What:** The vertical timeline line in the Journey section `scaleY`s from 0 → 1 as you scroll through the section. Timeline dots fade in only when the line's progress reaches them.

**Spec:**
- Target: `.timeline-line` (the `div.absolute.left-0.w-px.bg-neutral-200`)
- Effect: `scaleY: 0 → 1`, `transformOrigin: "top"`
- ScrollTrigger: `trigger: #iter`, `start: "top 60%"`, `end: "bottom 40%"`, `scrub: 0.3`, `ease: "none"`
- Dots: each dot has its own ScrollTrigger → `opacity: 0 → 1`, `scale: 0 → 1`, timed to fire when the line visually reaches them
- The `RevealOnScroll` wrappers on experience items stay (or get migrated) — they still entrance-animate independently

**Litmus:** Visualises progression through career as you scroll. Impossible with Framer Motion. The signature GSAP effect.

- [ ] Add class/ref to timeline line element
- [ ] Add class/ref to each timeline dot
- [ ] Create `useGSAP` block for line scaleY scrub
- [ ] Create staggered dot ScrollTriggers
- [ ] Test scroll speed sensitivity — `scrub: 0.3` should feel natural
- [ ] Verify mobile (line is `hidden md:block` — skip on mobile)

### B2. Divider lines grow from center

**What:** The horizontal `<Divider />` lines `scaleX` from 0 → 1 (transform-origin center) as they scroll into view. One-shot, not scrubbed.

**Spec:**
- Target: all `.section-divider` elements
- Effect: `scaleX: 0 → 1`, `transformOrigin: "center"`, `duration: 0.8`, `ease: "power3.out"`
- ScrollTrigger: `trigger: self`, `start: "top 90%"`, `toggleActions: "play none none none"`
- One-shot (not scrubbed) — they just grow in once

**Litmus:** Structural elements feel alive. Breath between sections becomes a micro-moment. Notice on the 3rd visit.

- [ ] Add GSAP batch animation for all `.section-divider` elements
- [ ] Verify all 3 dividers animate independently
- [ ] Test timing feels right (not too slow, not too snappy)

---

## Batch C — Divine Hermit Pinned Reveal

> The showpiece. The page freezes, something choreographed happens, then releases.

### C1. Pinned closing sequence

**What:** Pin the closing section. Over ~1.5 viewports of scroll distance:
1. Dostoevsky bust rises from below + scales from `0.85 → 1.0` + fades from `0.3 → 1`
2. "divine" sweeps in from the left (`x: -120 → 0`)
3. "hermit" sweeps in from the right (`x: 120 → 0`)
4. Section unpins, user continues

**Spec:**
- Target: `#closing` section
- ScrollTrigger: `trigger: #closing`, `start: "top top"`, `end: "+=150%"`, `pin: true`, `scrub: 0.5`
- Timeline:
  ```
  tl.from(bust, { scale: 0.85, y: 60, opacity: 0.3, duration: 1 })
    .from(divine, { x: -120, opacity: 0, duration: 0.6 }, "-=0.5")
    .from(hermit, { x: 120, opacity: 0, duration: 0.6 }, "<")
  ```
- Remove existing Framer `motion.div` `whileInView` on the text
- `prefers-reduced-motion`: skip pinning, show everything immediately

**Litmus:** Cinematic closing. Rewards scrolling all the way. Good on the 10th visit.

- [ ] Add `ref`s to bust wrapper, "divine" span, "hermit" span
- [ ] Replace `motion.div whileInView` with GSAP timeline
- [ ] Create pinned ScrollTrigger with timeline
- [ ] Test pin/unpin behavior (no layout jumps)
- [ ] Test with navbar hide logic (navbar should hide at closing)
- [ ] Test mobile — consider simpler non-pinned version
- [ ] Verify Dostoevsky hover-zoom still works after unpin

---

## Batch D — Project & Afflatus Card Stagger

> Polish pass on middle sections. Rhythm and directionality.

### D1. Project cards — choreographed stagger

**What:** Replace three individual `<RevealOnScroll>` wrappers on project cards with one GSAP stagger call. Cards cascade in with `120ms` spacing. Optional: diagram SVG edges draw in sequentially after card lands.

**Spec:**
- Target: project card containers (the `.group.grid` elements inside Opera)
- Effect: `y: 30`, `opacity: 0`, stagger `0.12`
- ScrollTrigger per card: `start: "top 88%"`, `toggleActions: "play none none none"`
- SVG edge draw-in: `strokeDashoffset` animation after card reveal (stretch goal)

- [ ] Add class to project card wrappers
- [ ] Replace `<RevealOnScroll>` with GSAP stagger
- [ ] Optional: SVG edge sequential draw-in
- [ ] Verify alternating layout (left/right) still works

### D2. Book/Music cards — directional rhythm

**What:** Books slide in from the left (`x: -20`), music slides in from the right (`x: 20`). Creates a visual "conversation" between columns.

**Spec:**
- Target: book cards (left column), music cards (right column)
- Books: `x: -20, opacity: 0`, stagger `0.1`
- Music: `x: 20, opacity: 0`, stagger `0.1`
- ScrollTrigger: `start: "top 85%"`, one-shot

- [ ] Add directional classes or refs to book/music card wrappers
- [ ] Replace `<RevealOnScroll>` with GSAP directional reveals
- [ ] Verify stagger rhythm feels natural

---

## Cut List

> Effects considered and deliberately excluded.

| Effect | Reason |
|--------|--------|
| 3D model scroll-linked opacity | Fights loading states, complexity > payoff |
| Marquee velocity response | Gimmicky, DESIGN.md flagged it |
| Section heading char-by-char stagger | Over-designed — simple reveal is more "quiet confidence" |
| Cover art parallax | DESIGN.md says no parallax — borderline even at 15px |
| Full Framer Motion removal | Keep for `AnimatePresence` + `layoutId` (bottom nav) |

---

## Post-Implementation

- [ ] `prefers-reduced-motion` audit — disable all scrub/pin, show content immediately
- [ ] `gsap.matchMedia()` — lighter effects on mobile
- [ ] Lighthouse check — no perf regressions
- [ ] Update `learnings.md` with GSAP/Lenis findings
- [ ] Audit remaining `RevealOnScroll` usages — migrate or keep deliberately

---

*Last updated: 2026-02-17 — Phase 0 complete, Batch A next.*
