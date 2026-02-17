# Mobile Responsiveness Plan

> Tracking document for making the portfolio fully functional and beautiful on phones.
> Updated as work progresses.

---

## Status Key

- [ ] Not started
- [~] In progress
- [x] Complete

---

## Phase 1 — Quick CSS Wins (Low Risk)

### WP-5: Bottom Nav — Mobile Adaptation
- [x] Center nav on mobile (`left: 50%; transform: translateX(-50%)`) instead of `right: 2rem`
- [x] Reduce padding / font-size slightly on `< 768px`
- [x] Hide hover hint labels on mobile (they require hover anyway)
- [ ] If still too wide, abbreviate to English hints only

**Files:** `globals.css`

### WP-7: General Mobile Polish
- [x] Side rule — verify hidden on mobile, add `hidden md:block` if needed
- [x] Section padding — reduce to `px-5` on `< 640px` if needed
- [x] FlowDiagram project cards — ensure they scale or scroll horizontally on small screens
- [x] Scroll indicator — check overlap with bottom nav
- [x] Verify hero text sizing at 375px

**Files:** `page.tsx`, `globals.css`

---

## Phase 2 — Layout & Modal Fixes (CSS-Only)

### WP-3: "Divine Hermit" Text — Viewport Fit
- [x] Reduce text size on mobile: `text-[clamp(2rem,10vw,7rem)]`
- [x] Reduce spacer: `w-[80px] md:w-[220px] lg:w-[280px]`
- [ ] Consider vertical stacking on very small screens (`< 400px`)
- [ ] Test at 320px, 375px, 414px

**Files:** `page.tsx` (closing section)

### WP-4: Section Modals — Mobile Scale + Positioning
- [x] Book modal: `max-width: 85vw`, nudge right on mobile
- [x] Design modal: `max-width: 85vw`, nudge right on mobile
- [x] Music modal: nudge right with `max-width: 85vw`
- [x] Reduce internal padding on all modals for mobile
- [ ] Ensure close buttons remain reachable, content doesn't clip right edge

**Files:** `globals.css`

---

## Phase 3 — Hero Scroll-Zoom (Flagship Mobile Interaction)

### WP-1: Hero Statue — Scroll-Driven Zoom + Dialog (Mobile)

**Problem:** No hover on touch. The statue is visible but inert.

**Approach:** On mobile (`max-width: 767px`), use ScrollTrigger to scrub the statue zoom as the user scrolls through the hero section. When zoom reaches ~80%, fade in the terminal dialog. The user scrolls naturally past — no tap required.

- [x] `StatueViewer.tsx` — accept `scrollProgress` prop (0-1) as alternative to `hovered`
- [x] `page.tsx` — add mobile-only GSAP ScrollTrigger on hero that writes `scrollProgress` to ref
- [x] Model-viewer camera orbit/fov interpolates between default and zoomed based on `scrollProgress`
- [x] Dialog fades in when `scrollProgress > 0.7`
- [x] Hero section gets `min-h-[150vh]` on mobile for scroll runway
- [x] Keep existing text fallback as safety net
- [ ] Respect `prefers-reduced-motion` — skip zoom, show dialog immediately

**Files:** `page.tsx`, `StatueViewer.tsx`

**Risk:** Model-viewer camera interpolation on low-end phones. Mitigation: respect reduced-motion, keep text fallback.

---

## Phase 4 — Dostoevsky Scroll-Zoom (Mirrors WP-1)

### WP-2: Dostoevsky Bust — Scroll-Driven Zoom + Quote (Mobile)

**Problem:** Same as hero — hover-gated, never fires on touch.

**Approach:** Mirror WP-1's pattern. Extend Batch C GSAP timeline: after bust reaches full opacity (~progress 0.6), scrub camera zoom to face, fade in quote dialog at ~0.8.

- [x] `DostoevskyBust.tsx` — accept `scrollProgress` prop
- [x] Closing section gets extra height on mobile (`30vh` spacer div) for scroll runway
- [x] Camera orbit/fov/target interpolate based on `scrollProgress`
- [x] Quote dialog appears at `scrollProgress > 0.75`
- [ ] Align "divine hermit" text entrance with bust reaching full zoom
- [ ] May need spacer div after section to ensure scrub completes

**Files:** `page.tsx`, `DostoevskyBust.tsx`

**Risk:** Closing section is last — need enough scrollable space for scrub.

---

## Section 3D Models — Keep on Mobile

The section 3D models (Da Vinci, Computer, Redbull, Helmet, Dog) stay on mobile. They add visual richness. If performance becomes an issue later, we can lazy-load more aggressively or reduce polygon count — but we don't hide them.

---

## Testing Checkpoints

After each phase:
1. `npm run build` — no regressions
2. Chrome DevTools responsive: 375px (iPhone SE), 390px (iPhone 14), 414px (iPhone Plus)
3. Desktop untouched — all mobile changes gated behind media queries / `gsap.matchMedia()`
4. `prefers-reduced-motion` — all new scroll animations skip gracefully

---

## Execution Order

| Phase | WPs | Status |
|-------|-----|--------|
| 1 | WP-5, WP-7 | Complete |
| 2 | WP-3, WP-4 | Complete |
| 3 | WP-1 | Complete |
| 4 | WP-2 | Complete |

---

## Log

### 2026-02-17: All 4 phases implemented
- **WP-5:** Bottom nav centered on mobile via `left: 50%; transform: translateX(-50%)`. Font reduced from 0.55rem/0.15em to 0.5rem/0.12em. Padding tightened. Hover hints hidden via `display: none` + `@media (min-width: 768px) { display: block }`.
- **WP-7:** Side rule hidden on mobile (`display: none` default, `display: flex` at md). FlowDiagram cards scale via SVG viewBox (no action needed). Scroll indicator and bottom nav don't overlap (indicator fades at 5% scroll, nav appears at 60%). Hero text clamp(2rem,5vw,4.5rem) = 32px at 375px — good.
- **WP-3:** Divine Hermit text reduced to `clamp(2rem,10vw,7rem)` on mobile. Spacer shrunk to `w-[80px]` on mobile.
- **WP-4:** All three modals capped at `max-width: 85vw` on mobile. Book modal info padding reduced to `1.5rem 1.25rem`. Design modal info padding reduced to `1.25rem 1rem`.
- **WP-1:** `StatueViewer` accepts `scrollProgress` prop. Hero section extended to `min-h-[150vh]` on mobile. GSAP ScrollTrigger scrubs progress 0→1 over first 60% of hero scroll. Camera zooms at 50%, dialog at 70%. Statue fade-out adjusted for longer section.
- **WP-2:** `DostoevskyBust` accepts `scrollProgress` prop. 30vh spacer added inside closing section (mobile only). ScrollTrigger scrubs from `top 40%` to `bottom bottom`. Camera zooms at 50%, quote at 75%.
