# GSAP + Lenis Integration Plan

> Deep research, rationale, and section-by-section implementation plan for integrating GSAP (with ScrollTrigger) and Lenis into the portfolio. This is the blueprint — nothing gets built without reviewing this first.

---

## Table of Contents

- [1. Why GSAP + Lenis](#1-why-gsap--lenis)
- [2. Library Profiles](#2-library-profiles)
- [3. Current Stack Audit](#3-current-stack-audit)
- [4. Migration Strategy: Framer Motion → GSAP](#4-migration-strategy-framer-motion--gsap)
- [5. Lenis Integration Plan](#5-lenis-integration-plan)
- [6. Section-by-Section Implementation](#6-section-by-section-implementation)
- [7. New Capabilities Unlocked](#7-new-capabilities-unlocked)
- [8. Architecture & File Structure](#8-architecture--file-structure)
- [9. Performance Considerations](#9-performance-considerations)
- [10. Risks & Mitigations](#10-risks--mitigations)
- [11. Phased Rollout](#11-phased-rollout)
- [12. Design Guardrail Compliance](#12-design-guardrail-compliance)
- [13. References](#13-references)

---

## 1. Why GSAP + Lenis

### The Problem with Framer Motion Alone

Framer Motion is excellent for declarative enter/exit animations in React, but it has real limitations for a portfolio of this ambition:

| Limitation | Impact |
|------------|--------|
| **No scroll-scrubbing** | Can't tie animation progress to scroll position (e.g., "divine hermit" text parting as Dostoevsky rises) |
| **No pinning** | Can't freeze a section while scroll-linked animation plays out |
| **No timeline sequencing** | Complex multi-step choreography requires manual state management |
| **Scroll jank** | `useInView` is binary (in/out), not continuous — no smooth scroll-linked parallax or progress-based reveals |
| **No smooth scroll** | Native browser scroll feels choppy; can't normalize across input devices (trackpad vs. mouse wheel) |
| **Bundle overhead** | Framer Motion is ~32KB gzipped. GSAP core is ~24KB. ScrollTrigger adds ~10KB. Comparable or lighter for far more power. |

### What GSAP + Lenis Solve

| Capability | Library | Description |
|-----------|---------|-------------|
| **Scroll-scrubbed animations** | GSAP ScrollTrigger | Tie any animation's progress to scroll position — `scrub: true` |
| **Section pinning** | GSAP ScrollTrigger | Pin an element while scroll-driven animation plays, then unpin |
| **Timeline orchestration** | GSAP Timeline | Chain, stagger, overlap animations with frame-perfect control |
| **Smooth scroll** | Lenis | Butter-smooth inertia-based scrolling, normalized across all inputs |
| **Scroll velocity** | Lenis | Expose `velocity` and `direction` for scroll-speed-responsive effects |
| **raf synchronization** | GSAP ticker + Lenis | Unified animation loop — Lenis feeds GSAP's ticker, everything stays in sync |

### The Duo: Industry Standard

Lenis + GSAP ScrollTrigger is the de facto stack for award-winning portfolio sites. Used by: Rockstar Games (GTA VI site), Microsoft Design, Shopify Supply, Getty Museum, Metamask. These are the exact sites this portfolio aspires to feel like.

---

## 2. Library Profiles

### GSAP (GreenSock Animation Platform)

| Key | Detail |
|-----|--------|
| **Version** | v3.x (latest) |
| **License** | **Free for all uses** (as of late 2024, thanks to Webflow acquisition) |
| **Core size** | ~24KB gzipped |
| **ScrollTrigger** | ~10KB gzipped, free plugin |
| **React integration** | `@gsap/react` — provides `useGSAP()` hook for safe cleanup via `gsap.context()` |
| **SSR-safe** | Yes — `useGSAP()` uses `useIsomorphicLayoutEffect` pattern, works with `"use client"` |
| **Key plugins (free)** | ScrollTrigger, ScrollTo, Observer, Flip, Draggable, SplitText, ScrambleText |

#### Core Concepts

- **Tween**: `gsap.to()`, `gsap.from()`, `gsap.fromTo()` — animate any property of any object
- **Timeline**: `gsap.timeline()` — sequence tweens with position parameters, control as a unit
- **ScrollTrigger**: Attach any tween/timeline to scroll progress. Configure `start`, `end`, `scrub`, `pin`, `markers`
- **Stagger**: Built-in stagger across multiple targets — `stagger: { each: 0.08, from: "start" }`
- **Easing**: Rich easing library including `"power3.out"`, `"expo.out"`, `"back.out(1.7)"`, `CustomEase`
- **`gsap.context()`**: React cleanup mechanism — revert all animations created in scope
- **`gsap.matchMedia()`**: Media-query-aware animations — different configs for mobile/desktop

#### GSAP in React (useGSAP)

```tsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function MyComponent() {
  const container = useRef(null);

  useGSAP(() => {
    // All animations auto-cleaned on unmount
    gsap.from(".reveal", {
      y: 60, opacity: 0, duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".reveal",
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: container });

  return <div ref={container}>...</div>;
}
```

### Lenis

| Key | Detail |
|-----|--------|
| **Version** | v1.3.17 (latest) |
| **License** | MIT |
| **Size** | ~4KB gzipped |
| **React package** | `lenis/react` — provides `<ReactLenis>` wrapper and `useLenis()` hook |
| **GSAP integration** | First-class — documented sync pattern with `gsap.ticker` |
| **Key features** | Smooth wheel scroll, configurable lerp/duration/easing, velocity exposure, anchor support, `data-lenis-prevent` for nested scroll |

#### How Lenis Works

Unlike CSS-transform-based smooth scroll libraries (Locomotive, ScrollSmoother), Lenis:
- Uses native scroll (`window.scrollTo`) — preserves `position: sticky`, `IntersectionObserver`, CSS snap, and native scrollbar
- Runs in the main thread (intentionally — keeps scroll-linked animations in perfect sync)
- Under 4KB gzipped — minimal overhead
- Normalizes trackpad, mouse wheel, and programmatic scroll into a unified, configurable experience

#### Lenis Settings For This Portfolio

```ts
new Lenis({
  lerp: 0.08,          // Smooth but not sluggish — matches "quiet confidence"
  duration: 1.2,       // Fallback if lerp isn't set
  smoothWheel: true,
  anchors: true,       // Enable smooth scroll to #section anchors (nav links)
  autoRaf: false,      // We'll sync with GSAP's ticker instead
});
```

#### GSAP + Lenis Sync Pattern

```ts
const lenis = new Lenis({ autoRaf: false });

// Feed Lenis into GSAP's unified ticker
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

This ensures:
1. Lenis handles scroll interpolation
2. GSAP's ticker drives the animation loop (single rAF)
3. ScrollTrigger receives Lenis's smoothed scroll position
4. Everything stays in sync — no jank, no drift

---

## 3. Current Stack Audit

### Animation Components & Their GSAP Equivalents

| Component | Current Tech | Lines | GSAP Replacement | Effort |  
|-----------|-------------|-------|-------------------|--------|
| `RevealOnScroll` | Framer Motion `useInView` + `motion.div` | 52 | GSAP `scrollTrigger` + `gsap.from()` | **Low** — direct 1:1 mapping |
| `SplitText` | Framer Motion per-char `motion.span` with `useInView` | 63 | GSAP `SplitText` plugin + stagger | **Medium** — plugin handles splitting |
| `FadeSwapText` | Framer `AnimatePresence` crossfade | 60 | GSAP `gsap.to()` opacity swap | **Low** — simpler with GSAP |
| `ScrambleText` | Custom rAF + refs | 119 | GSAP `ScrambleTextPlugin` | **Low** — plugin does this natively |
| `MagneticLink` | Custom rAF spring loop | 98 | Keep as-is or use GSAP `gsap.to()` with `overwrite: "auto"` | **Optional** — works fine |
| `CustomCursor` | Custom rAF lerp | 147 | Keep as-is (perf-critical, already optimized) | **Skip** |
| `MarqueeStrip` | CSS keyframes | 37 | Keep as-is (CSS animation is simplest here) | **Skip** |
| `FlowDiagram` | SVG + Framer Motion stagger | — | GSAP `stagger` + `drawSVG` (free plugin) | **Medium** |
| `GrainOverlay` | Pure CSS | 20 | Keep as-is | **Skip** |
| Bottom Nav | Framer `AnimatePresence` + `layoutId` | ~60 | Framer Motion **keep** (layoutId is unique to FM) | **Skip** |
| Closing "divine hermit" | Framer `whileInView` | ~20 | GSAP ScrollTrigger **scrub** (the big upgrade) | **High value** |

### Components to Keep on Framer Motion

- **Bottom Nav** — `AnimatePresence` + `layoutId` indicator is a Framer Motion-native feature. GSAP has no direct equivalent. Keep it.
- **Any `AnimatePresence` exit animations** — GSAP doesn't handle unmount animations as elegantly in React.

### Components to Migrate

Everything else. GSAP provides more control, better performance for scroll-driven work, and reduces the dual-library overhead.

### Verdict: Hybrid Approach

**Keep Framer Motion only for:** `AnimatePresence`, `layoutId` animations (bottom nav indicator).  
**Use GSAP for:** All scroll reveals, scroll-scrubbed effects, text animations, timeline orchestration.  
**Use Lenis for:** Smooth scroll foundation, anchor navigation, velocity exposure.

---

## 4. Migration Strategy: Framer Motion → GSAP

### Phase 1: Foundation (Non-Breaking)

Install GSAP + Lenis alongside Framer Motion. No removals yet.

```bash
npm install gsap @gsap/react lenis
```

### Phase 2: Create Core Hooks

#### `useGSAPScrollReveal` — Drop-in replacement for `RevealOnScroll`

```tsx
// src/app/hooks/useScrollReveal.ts
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function useScrollReveal(options?: {
  y?: number;
  x?: number;
  delay?: number;
  duration?: number;
  ease?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { y = 60, x = 0, delay = 0, duration = 0.9, ease = "power3.out" } = options ?? {};

  useGSAP(() => {
    if (!ref.current) return;
    gsap.from(ref.current, {
      y, x, opacity: 0, duration, delay, ease,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  }, { scope: ref });

  return ref;
}
```

### Phase 3: Migrate Section by Section

Replace each `<RevealOnScroll>` wrapper with the GSAP hook, test, verify, move on. Each section is independent — low risk.

### Phase 4: Remove Framer Motion Dependency (Optional)

Only after all non-AnimatePresence uses are migrated. If AnimatePresence is still needed for the nav, Framer stays (it's tree-shakeable).

---

## 5. Lenis Integration Plan

### Provider Component

```tsx
// src/app/components/SmoothScroll.tsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      anchors: true,
    });

    lenisRef.current = lenis;

    // Sync Lenis → GSAP ticker → ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <>{children}</>;
}
```

### Mounting in Layout

```tsx
// src/app/layout.tsx
import SmoothScroll from "./components/SmoothScroll";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
```

### Anchor Navigation

The bottom nav uses `href="#opera"`, `href="#iter"`, etc. With `anchors: true`, Lenis will automatically smooth-scroll to these anchors. This replaces any future `scrollIntoView` calls.

### model-viewer Compatibility

`<model-viewer>` uses internal scroll listeners for camera controls. Since we've disabled `camera-controls` on all models and use `pointer-events: none`, there's no conflict with Lenis. However, if any future model needs camera controls, wrap it in `data-lenis-prevent`.

---

## 6. Section-by-Section Implementation

### I. PRINCIPIUM — Hero

| Effect | Current | GSAP/Lenis Upgrade |
|--------|---------|-------------------|
| Hero text fade-in | `RevealOnScroll` (Framer) | GSAP `gsap.from()` with stagger on mount — no scroll trigger needed (it's the hero) |
| "02-davinci-01" → "Vedant Nagwanshi" | `FadeSwapText` (Framer AnimatePresence) | Keep Framer for now (crossfade works), or migrate to GSAP opacity tween |
| Scroll indicator fade | `RevealOnScroll` delay=1.0 | GSAP timeline: fade in at 1s, then `ScrollTrigger` to fade out as user scrolls |
| **NEW: Hero parallax-out** | None | ScrollTrigger: as user scrolls past hero, text fades out + translates up, statue scales subtly. `scrub: 0.5` |
| **NEW: Scroll-linked statue zoom** | Binary hover | ScrollTrigger: subtle camera orbit change tied to scroll progress — statue rotates slightly as page scrolls |

#### Hero Parallax-Out (New Effect)

```ts
gsap.to(".hero-text", {
  y: -80, opacity: 0,
  scrollTrigger: {
    trigger: "section.hero",
    start: "top top",
    end: "bottom 60%",
    scrub: 0.5,
  },
});
```

This creates the classic "content fades away as you scroll past" — makes the hero feel alive rather than just sitting there.

---

### II. OPERA — Works

| Effect | Current | GSAP/Lenis Upgrade |
|--------|---------|-------------------|
| Section heading reveal | `RevealOnScroll` | `useScrollReveal()` hook |
| Project card reveals | `RevealOnScroll` with stagger | GSAP `gsap.from(".project-card", { stagger: 0.15, scrollTrigger })` — cleaner, one call |
| FlowDiagram SVG | Framer stagger | GSAP stagger on SVG elements with ScrollTrigger — animate edges drawing in sequentially |
| **NEW: Project image parallax** | None | Subtle `y` parallax on project preview images: they move slightly slower than scroll. `scrub: true` on inner image. |

---

### III. ITER — Journey / Timeline

| Effect | Current | GSAP/Lenis Upgrade |
|--------|---------|-------------------|
| Section heading reveal | `RevealOnScroll` | `useScrollReveal()` |
| Timeline items reveal | Staggered `RevealOnScroll` | GSAP batch reveal with stagger |
| Timeline line | Static `div` | **NEW: Scroll-scrubbed line draw** — the vertical timeline line `scaleY` from 0 to 1 as you scroll through the section. `scrub: true`. Beautiful. |
| Timeline dots | Static | **NEW: Dots appear as line reaches them** — each dot fades in when the line's progress reaches its position |

#### Timeline Line Draw (Signature Effect)

```ts
gsap.fromTo(".timeline-line", 
  { scaleY: 0, transformOrigin: "top" },
  {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#iter",
      start: "top 60%",
      end: "bottom 40%",
      scrub: 0.3,
    },
  }
);
```

This is the single highest-impact GSAP effect in the entire plan. A timeline that literally draws itself as you scroll is **chef's kiss** for a journey section.

---

### IV. ARTIFICIUM — Craft

| Effect | Current | GSAP/Lenis Upgrade |
|--------|---------|-------------------|
| Section reveal | `RevealOnScroll` | `useScrollReveal()` |
| Design gallery | `DesignGallery` component | Keep internal logic, add ScrollTrigger reveals for cards |
| **NEW: Gallery stagger** | None | Cards animate in with a cascading stagger tied to scroll — each card slides up 20px + fades in as you scroll through |

---

### V. AFFLATUS — Inspiration

| Effect | Current | GSAP/Lenis Upgrade |
|--------|---------|-------------------|
| Book/Music cards | `RevealOnScroll` stagger | GSAP stagger with ScrollTrigger |
| **NEW: Cover art parallax** | None | Subtle `y: -15` on book covers and album art, `scrub: 0.5` — covers float slightly against the scroll direction |

---

### VI. NEXUS — Connect

| Effect | Current | GSAP/Lenis Upgrade |
|--------|---------|-------------------|
| Section reveal | `RevealOnScroll` | `useScrollReveal()` |
| Magnetic links | Custom rAF | Keep as-is (already performant) |

---

### CLOSING — "Divine Hermit" Dostoevsky

**This is the showpiece of the GSAP integration.** The current implementation is a static `whileInView` fade-in. With GSAP ScrollTrigger, this becomes a **scroll-scrubbed dramatic reveal**.

| Effect | Current | GSAP/Lenis Upgrade |
|--------|---------|-------------------|
| "divine" / "hermit" text | `motion.div` `whileInView` opacity | **Scroll-scrubbed:** text starts spread apart, pulls together as bust rises. Or: text starts at 0 opacity and sweeps in from the sides as scroll progresses |
| Dostoevsky bust | Static (hover zoom) | **Scroll-scrubbed:** bust scales from 0.85 → 1.0 as you scroll into the section + subtle y-translate |
| **NEW: Pinned closing** | None | Pin the section while the bust animation plays, then unpin. Creates a dramatic "pause" at the end |

#### Closing Sequence Timeline

```ts
const closingTl = gsap.timeline({
  scrollTrigger: {
    trigger: "#closing",
    start: "top top",
    end: "+=150%",     // 1.5x viewport of scroll distance
    pin: true,         // freeze the section
    scrub: 0.5,
  },
});

closingTl
  .from(".dostoevsky-bust", { scale: 0.85, y: 60, opacity: 0.3, duration: 1 })
  .from(".divine-text", { x: -120, opacity: 0, duration: 0.6 }, "-=0.5")
  .from(".hermit-text", { x: 120, opacity: 0, duration: 0.6 }, "<");
```

**Result:** The user scrolls into the closing section, the page pins, and over 1.5 viewports of scroll distance:
1. The Dostoevsky bust rises into view and scales up
2. "divine" sweeps in from the left
3. "hermit" sweeps in from the right
4. Section unpins, user continues to see the fully composed piece

This transforms the closing from "just another section" into a **cinematic moment**.

---

## 7. New Capabilities Unlocked

These effects are impossible or impractical with Framer Motion alone:

### Scroll-Scrubbed Effects
- Hero parallax-out on scroll
- Timeline line drawing progressively
- "Divine hermit" choreographed entrance
- Book/album cover micro-parallax

### Pinning
- Close section pinned during Dostoevsky reveal
- Potential: pin the Opera section while showing a project carousel

### Scroll Velocity Reactions
- MarqueeStrip speed responds to scroll velocity (via `lenis.velocity`)
- Heading letters spread apart based on scroll speed (kinetic typography)
- 3D model rotation speed tied to scroll velocity

### Performance-Linked Scrolling
- Lenis normalizes scroll across trackpad/mouse/touch
- Smooth anchor navigation for the bottom nav
- Consistent 60fps scroll experience

---

## 8. Architecture & File Structure

### New Files

```
src/app/
├── components/
│   ├── SmoothScroll.tsx         ← Lenis provider + GSAP ticker sync
│   ├── ScrollReveal.tsx         ← GSAP-based replacement for RevealOnScroll
│   └── (existing components)
├── hooks/
│   ├── useScrollReveal.ts       ← Reusable scroll reveal hook
│   ├── useScrollProgress.ts     ← Expose scroll progress for a trigger element
│   └── useLenisScroll.ts        ← Access Lenis instance (velocity, direction)
├── lib/
│   └── gsap.ts                  ← Centralized GSAP registration (plugins, config)
```

### Centralized GSAP Registration

```tsx
// src/app/lib/gsap.ts
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Set global defaults matching DESIGN.md
gsap.defaults({
  ease: "power3.out",     // Matches cubic-bezier(0.16, 1, 0.3, 1)
  duration: 0.6,
});

export { gsap, ScrollTrigger, useGSAP };
```

Import from `@/app/lib/gsap` everywhere — single source of truth for plugin registration.

---

## 9. Performance Considerations

### Bundle Impact

| Library | Size (gzipped) | Notes |
|---------|----------------|-------|
| Framer Motion (current) | ~32KB | Tree-shakeable, but we use most of it |
| GSAP core | ~24KB | Smaller than FM |
| ScrollTrigger | ~10KB | Free, loaded only where needed |
| @gsap/react | ~1KB | Tiny |
| Lenis | ~4KB | Extremely lightweight |
| **Total GSAP+Lenis** | **~39KB** | Replaces most of FM's 32KB, adds scroll capabilities |

**Net delta:** +7KB for dramatically more capability. If we eventually remove Framer Motion (keeping only AnimatePresence), the delta is nearly zero.

### Runtime Performance

- **Lenis main-thread scroll:** Intentional trade-off. Keeps scroll-linked animations in perfect sync. Lenis is <4KB and uses native `window.scrollTo` — not CSS transforms.
- **GSAP ticker:** Single rAF loop drives everything. No competing loops.
- **`will-change` discipline:** Only on elements actively animating. GSAP sets and clears automatically via `force3D: "auto"`.
- **ScrollTrigger cleanup:** `useGSAP()` auto-reverts all ScrollTriggers on unmount. No memory leaks.
- **`gsap.matchMedia()`:** Skip expensive scroll animations on mobile where they'd jank.

### Lenis Limitations to Monitor

- Capped at 60fps on Safari (WebKit bug) — acceptable for this portfolio's aesthetic
- `position: fixed` may lag on pre-M1 Safari — our nav is fixed but lightweight
- No CSS `scroll-snap` support — we don't use scroll-snap, so no conflict
- Smooth scroll stops over iframes — no iframes in the portfolio

---

## 10. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Lenis conflicts with model-viewer scroll | Medium | All models have `pointer-events: none` + `camera-controls` disabled. Add `data-lenis-prevent` on any future interactive model. |
| Over-animating — violates "quiet confidence" | High | Apply DESIGN.md litmus tests to every effect. Scroll-scrub values should be subtle (10-20px, not 50px). Keep `scrub` values ≥ 0.3 for smoothness. |
| GSAP + Framer Motion double-rendering | Low | They target different elements. GSAP uses refs/selectors, FM uses `motion.*` components. No overlap if migration is clean. |
| React 19 Compiler + GSAP | Medium | React Compiler may over-optimize GSAP ref access. Use `useGSAP()` hook (designed for this). Test thoroughly. Document in learnings.md. |
| Lenis breaks anchor link behavior | Low | Set `anchors: true` in Lenis config. Test all nav anchor scrolls. |
| Mobile performance with smooth scroll | Medium | Use `gsap.matchMedia()` to disable scrub effects on mobile. Lenis `lerp: 0.08` is conservative. |

---

## 11. Phased Rollout

### Phase 1 — Foundation (1-2 hours)

- [ ] Install `gsap`, `@gsap/react`, `lenis`
- [ ] Create `src/app/lib/gsap.ts` (centralized registration)
- [ ] Create `SmoothScroll.tsx` provider
- [ ] Mount `SmoothScroll` in `layout.tsx`
- [ ] Import `lenis/dist/lenis.css`
- [ ] Verify smooth scrolling works, anchor nav works, no model-viewer conflicts

### Phase 2 — Core Hooks (1 hour)

- [ ] Create `useScrollReveal` hook
- [ ] Create `useScrollProgress` hook
- [ ] Test with one section (e.g., Opera heading)

### Phase 3 — Migrate Reveals (2-3 hours)

- [ ] Replace all `RevealOnScroll` usages with GSAP-based reveals, section by section
- [ ] Migrate `SplitText` to GSAP SplitText (if using the plugin) or keep custom
- [ ] Verify each section animates correctly
- [ ] Test on mobile — disable scrub effects via `matchMedia`

### Phase 4 — Scroll-Scrubbed Effects (2-3 hours)

- [ ] Hero parallax-out
- [ ] Iter timeline line draw
- [ ] "Divine hermit" closing sequence (pin + scrub)
- [ ] Book/album cover micro-parallax

### Phase 5 — Polish (1-2 hours)

- [ ] Scroll-velocity-responsive marquee speed
- [ ] Fine-tune `lerp`, `scrub` values
- [ ] Test `prefers-reduced-motion` — disable Lenis smooth scroll + all scrub animations
- [ ] Run Lighthouse, check for regressions
- [ ] Update `learnings.md` with GSAP/Lenis findings
- [ ] Update `DESIGN.md` §8 to reflect new animation stack

### Phase 6 — Cleanup (Optional, 1 hour)

- [ ] Remove Framer Motion `RevealOnScroll` component
- [ ] Remove Framer Motion `SplitText` component (if migrated)
- [ ] Audit unused Framer Motion imports
- [ ] Consider removing `framer-motion` from `package.json` if only AnimatePresence remains

**Total estimated effort: 8-12 hours**

---

## 12. Design Guardrail Compliance

Every GSAP/Lenis effect must pass the DESIGN.md litmus tests. Here's the pre-check:

| Effect | Serves content? | Noticeable if removed? | 60fps? | One-sentence justification | Good on 10th visit? |
|--------|:-:|:-:|:-:|---|:-:|
| Smooth scroll (Lenis) | ✅ | ✅ | ✅ | Normalizes scroll feel across devices, creating consistent UX | ✅ |
| Hero parallax-out | ✅ | ✅ | ✅ | Guides eye from hero content to next section naturally | ✅ |
| Timeline line draw | ✅ | ✅ | ✅ | Visualizes progression through career journey as you scroll | ✅ |
| Divine hermit pinned reveal | ✅ | ✅ | ✅ | Creates a cinematic closing moment that rewards full scrolling | ✅ |
| Cover art parallax | ⚠️ | ⚠️ | ✅ | Adds depth to flat cards — subtle enough to not distract | ✅ |
| Scroll-velocity marquee | ⚠️ | ❌ | ✅ | Fun but not essential — implement last, cut if it feels gimmicky | ⚠️ |

**Decision:** Skip scroll-velocity marquee initially. Focus on the top 4 effects.

### Motion Rules Compliance

- **Enter from stillness:** ✅ All GSAP `from()` tweens start from offset → resting state
- **Ease out, not ease in:** ✅ `"power3.out"` ≈ `cubic-bezier(0.16, 1, 0.3, 1)`
- **300-600ms duration:** ✅ Default `0.6s`, reveals at `0.9s` (matches current)
- **Stagger 60-100ms:** ✅ `stagger: 0.08`
- **Scroll reveals 10-20px:** ⚠️ Current `RevealOnScroll` uses 60px. GSAP migration is an opportunity to reduce to 20-30px per DESIGN.md
- **No parallax:** ⚠️ The hero parallax-out and cover parallax are borderline. Keep them extremely subtle (max 15-20px) and test. If they feel "parallax-y", cut them.

---

## 13. References

### GSAP
- GSAP Docs: https://gsap.com/docs/v3/
- GSAP + React Guide: https://gsap.com/resources/React/
- ScrollTrigger Docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- `useGSAP()` Hook: https://www.npmjs.com/package/@gsap/react
- GSAP Eases Visualizer: https://gsap.com/docs/v3/Eases
- GSAP SplitText: https://gsap.com/docs/v3/Plugins/SplitText
- GSAP matchMedia: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()

### Lenis
- Lenis GitHub: https://github.com/darkroomengineering/lenis
- Lenis React Docs: https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md
- Lenis Demo: https://lenis.darkroom.engineering/
- Lenis npm: https://www.npmjs.com/package/lenis (v1.3.17, 256K weekly downloads)

### Integration Examples
- Lenis + GSAP ScrollTrigger setup: documented in Lenis README
- Award-winning sites using this stack: GTA VI (Rockstar), Microsoft Design, Shopify Supply, Getty Museum

### Portfolio-Specific
- [DESIGN.md](DESIGN.md) — Design bible, all effects must comply
- [learnings.md](learnings.md) — Log new GSAP/Lenis findings here

---

*This plan is a living document. Update it as implementation reveals new insights or trade-offs.*
