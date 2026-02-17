# Learnings — Agent Notebook

> A running log of research, gotchas, fixes, and references gathered during the build. The agent should consult this before tackling any issue and append new findings as they come up.
>
> Referenced by: [portfolio.agent.md](.github/agents/portfolio.agent.md) · [DESIGN.md](DESIGN.md)

---

## Table of Contents

- [model-viewer](#model-viewer)
- [Custom Cursor](#custom-cursor)
- [Tailwind CSS v4](#tailwind-css-v4)
- [Framer Motion](#framer-motion)
- [Next.js 16 / React 19](#nextjs-16--react-19)
- [Performance](#performance)
- [Bugs Fixed](#bugs-fixed)
- [Resources](#resources)

---

## model-viewer

### Cursor override issue
`<model-viewer>` internally sets its own cursor styles on its shadow DOM elements. Setting `cursor: none` on the host element alone isn't enough — you also need to target its internal parts via CSS `::part()` selectors:

```css
model-viewer,
model-viewer::part(default-progress-bar) {
  cursor: none !important;
}
```

Also pass `cursor: "none"` in the inline `style` prop on the `<model-viewer>` element itself.

### z-index layering
The hero statue model-viewer sits at `z-index: 15`. The terminal dialog sits at `z-index: 10` (visually behind the statue). The hover zone in `page.tsx` sits at `z-index: 16` above both. Other section model-viewers also use `z-index: 15`.

### Hover zone blocks clicks to dialog (2026-02-17)
**Problem:** The invisible hover zone (`z-index: 16`, right 50% of hero) intercepts ALL clicks, preventing the Resume Granted `<a>` at `z-index: 10` from receiving them. `statueWrapperRef` has `opacity < 1` which creates a stacking context at effective z-0, so everything inside it (dialog, model) is below the hover zone regardless of inner z-index values.
**Fix:** Hide-and-peek technique on the hover zone's `onClick`:
```js
onClick={(e) => {
  const el = e.currentTarget;
  el.style.pointerEvents = 'none';
  const below = document.elementFromPoint(e.clientX, e.clientY);
  el.style.pointerEvents = '';
  const anchor = below instanceof HTMLAnchorElement ? below : below?.closest('a');
  if (anchor) anchor.click();
}}
```
This keeps the hover zone active for `mouseenter`/`mouseleave` (statue zoom) while forwarding clicks to the `<a>` below.

### Shadow DOM pointer-events
External CSS (`model-viewer canvas {}`) and host-level `pointer-events: none` do NOT reliably disable pointer events on model-viewer's Shadow DOM internals. Don't fight it — use z-index stacking and click-forwarding instead.

### Camera & interaction
- `disable-zoom` and `disable-pan` prevent user from breaking the intended camera framing.
- `camera-controls` is intentionally **omitted** so the pointer doesn't get hijacked for orbit.
- `interaction-prompt="none"` suppresses the default "drag to rotate" hint.
- `interpolation-decay="200"` controls how smoothly the camera animates between states.

### Hover zoom to face
On model load, we calculate the face position from bounding box:
```js
const dims = mv.getDimensions();
const center = mv.getBoundingBoxCenter();
const faceY = center.y + dims.y * 0.38;
```
Fallback target: `"0m 0.45m 0m"`.

### Docs & References
- model-viewer docs: https://modelviewer.dev/
- model-viewer GitHub: https://github.com/google/model-viewer
- Attributes reference: https://modelviewer.dev/docs/index.html
- CSS `::part()` for model-viewer: https://modelviewer.dev/docs/index.html#entrydocs-stagingandcameras-css

---

## Custom Cursor

### Architecture
Two elements: `.cursor-dot` (8px, instant position via transform) and `.cursor-ring` (40px, follows with lerp at 0.12 factor via rAF).

### Key decisions
- Skipped entirely on touch devices (`ontouchstart` / `maxTouchPoints` / `max-width: 768px`).
- Skipped if `prefers-reduced-motion: reduce`.
- Uses `mix-blend-mode: difference` so it's visible on both light and dark backgrounds.
- Hover state: dot expands to 60px white circle, ring collapses to 0.
- `will-change: transform` + `contain: layout style` for GPU compositing.

### Hover detection
Attaches listeners to `a, button, [data-cursor-hover]` on mount. If new interactive elements are added dynamically after mount, they won't get hover listeners automatically — would need MutationObserver or event delegation to fix.

### Gotcha: body cursor
`cursor: none` must be set on `body`, all `a`/`button` elements, AND on `model-viewer` (see above). Otherwise the default cursor flashes through.

---

## Tailwind CSS v4

### Import syntax
v4 uses `@import "tailwindcss"` instead of `@tailwind` directives.

### Theme inline
Custom theme values are defined with `@theme inline { ... }` block in CSS, not in `tailwind.config.js`.

### CSS variables
Tailwind v4 reads CSS custom properties directly. The `--font-sans` and `--font-mono` in `@theme inline` map to Tailwind's `font-sans` / `font-mono` utility classes.

---

## Framer Motion

### AnimatePresence
Used for the glass dialog enter/exit. Requires `key` on the child or conditional rendering pattern. Current implementation uses conditional `{dialogOpen && <motion.div>}` inside `<AnimatePresence>`.

### Transition easing
The project uses `[0.23, 1, 0.32, 1]` (custom cubic bezier) for most Framer transitions — close to the design system's `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## Next.js 16 / React 19

### React Compiler
`babel-plugin-react-compiler` is installed — React Compiler is active. This auto-memoizes, so explicit `useMemo`/`useCallback` are less critical but still used for clarity in perf-sensitive spots (rAF loops, event handlers).

### Dynamic imports
`StatueViewer` is loaded via `next/dynamic` with `ssr: false` since `@google/model-viewer` accesses browser APIs. Loading placeholder is a pulsing div.

### Web components in React 19
React 19 has improved web component support. `<model-viewer>` attributes are passed as strings. The `ref` callback pattern is used instead of `useRef` to attach the load listener.

### TypeScript
`model-viewer.d.ts` exists at `src/` to suppress TS errors for the `<model-viewer>` JSX element.

---

## Performance

### Strategies in use
- `contain: layout style paint` on model-viewer for layout isolation
- `will-change: transform` on cursor elements only (not broadly)
- `contain: strict` on grain overlay
- Passive event listeners for mousemove
- IntersectionObserver for lazy model loading (200px rootMargin)
- Film grain uses inline SVG data URI (no network request)

### What to watch
- model-viewer is heavy (~200KB). It's lazy-loaded but still the biggest chunk.
- Grain overlay re-renders on scroll if not isolated — `contain: strict` + `pointer-events: none` keeps it cheap.

---

## Bugs Fixed

### 2026-02-15: Cursor snaps to default on statue body
**Problem:** Moving the cursor over the `<model-viewer>` element caused the cursor to revert to the browser default, breaking the custom cursor illusion.
**Root cause:** `<model-viewer>` sets its own cursor styles internally via shadow DOM.
**Fix:** Added `cursor: "none"` to the inline style on `<model-viewer>`, plus CSS rules targeting `model-viewer` and `model-viewer::part(default-progress-bar)` with `cursor: none !important`.

### 2026-02-15: Glass CRT dialog not visible on hover
**Problem:** The translucent CRT-style resume dialog appeared behind the 3D statue model, making it invisible.
**Root cause:** Dialog had `z-10` (z-index: 10) but model-viewer had inline `zIndex: 15`. Dialog was being painted beneath the model.
**Fix:** Changed dialog from `z-10` to `z-20` so it layers above the model's z-index of 15.

### 2026-02-16: JourneyComputer 3D model not rendering
**Problem:** The `<model-viewer>` in the Iter section showed nothing — element existed but was invisible.
**Root causes (3 issues):**
1. **GLB too large:** `redbull_can_grenade_-_flashbang.glb` was 53MB — browser may silently fail or take forever to decode.
2. **Missing ref callback:** StatueViewer uses `ref={(el) => { modelRef.current = el }}` callback pattern. JourneyComputer had no ref at all, which can cause issues with model-viewer's lifecycle in React's strict mode.
3. **`camera-controls` conflict with `auto-rotate`:** Having `camera-controls` enabled alongside `auto-rotate` can cause the model to appear blank if the pointer interaction hijacks the initial render. StatueViewer deliberately omits `camera-controls`. Removed it.
4. **`pointerEvents: "none"` missing:** StatueViewer uses `pointerEvents: "none"` to prevent interaction conflicts. Added to match.
**Fix:** Switched to `personal_computer.glb` (874KB), added ref callback, removed `camera-controls`, added `pointerEvents: "none"`, ensured parent grid cell has `minHeight: 340px` and `RevealOnScroll` gets `className="w-full"`.

---

## Resources

### Design Inspiration
- https://www.awwwards.com/ — Award-winning web design
- https://minimal.gallery/ — Minimal website showcase
- https://www.hoverstates.com/ — Interactive design collection

### Technical References
- Tailwind v4 docs: https://tailwindcss.com/docs
- Framer Motion docs: https://motion.dev/docs
- Next.js docs: https://nextjs.org/docs
- React 19 reference: https://react.dev/reference/react
- model-viewer docs: https://modelviewer.dev/docs/
- Three.js docs: https://threejs.org/docs/
- CSS `contain` property: https://developer.mozilla.org/en-US/docs/Web/CSS/contain
- `will-change` best practices: https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
- `::part()` CSS pseudo-element: https://developer.mozilla.org/en-US/docs/Web/CSS/::part

### Typography
- JetBrains Mono: https://www.jetbrains.com/lp/mono/
- Space Grotesk: https://fonts.google.com/specimen/Space+Grotesk

### Tools
- glTF Transform (model optimization): https://gltf-transform.dev/
- Squoosh (image compression): https://squoosh.app/
- PageSpeed Insights: https://pagespeed.web.dev/

---

## model-viewer Procedural Textures

### Applying runtime textures to GLB models (2026-02-16)
model-viewer's scene graph API allows procedural textures via `createCanvasTexture()`:

```js
const texture = mv.createCanvasTexture();
const canvas = texture.source.element; // HTMLCanvasElement
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');
// ... draw on canvas ...
texture.source.update(); // IMPORTANT: call after drawing

// Apply to material
material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
material.normalTexture.setTexture(normalTexture);
```

Key texture channels available:
- `pbrMetallicRoughness.baseColorTexture` — diffuse/albedo color
- `pbrMetallicRoughness.metallicRoughnessTexture` — metal (B) + rough (G)
- `normalTexture` — surface detail bumps (RGB encoded normals)
- `occlusionTexture` — ambient occlusion
- `emissiveTexture` — glow/emission

### Normal map generation from height field
To convert noise height data to a normal map:
- Compute dX/dY height differences between neighboring pixels
- Normal = normalize(-dX, -dY, 1.0)
- Encode: R = (nx*0.5+0.5)*255, G = (ny*0.5+0.5)*255, B = (nz*0.5+0.5)*255
- Flat surface = (128, 128, 255) blue

### Gotcha: texture guard
Use a ref (`texturesApplied.current`) to prevent re-applying textures on React re-renders, since `onModelLoad` can fire multiple times.

### Gotcha: baseColorFactor × baseColorTexture
These multiply together. If you set both, the factor tints the texture. Set factor to [1,1,1,1] for pure texture color, or use it to darken/warm the texture.

### Photogrammetry models — don't override native textures (2026-02-16)
The `dostoevsky-rock.glb` is a photogrammetry rock-scan with baked-in stone textures. Applying procedural stone textures on top made it look muddy/dark. **Rule: if a model already has real-world scanned textures, skip procedural overrides.** Just tweak PBR factors (metallic, roughness) and use `baseColorFactor` > 1.0 to brighten for white backgrounds. `exposure="2.2"` + `shadow-softness="0.8"` helps lift the model on a light page.

### Camera orbits for standing figures vs busts
- **Bust**: orbit ~105% distance, 75deg polar angle, zoom at ~240% distance with tight FOV (14deg)
- **Standing figure**: similar default distance but zoom at ~55% with wider FOV (22deg) so the face fills the frame. Face target: `center.y + dims.y * 0.32` (not 0.35 — accounts for the pedestal base).

---

### Modal scrollbar jerk fix (2026-02-16)
When `overflow: hidden` is set on body to lock scroll during modals, the scrollbar disappears and the layout shifts by the scrollbar width. **Fix:** measure scrollbar width with `window.innerWidth - document.documentElement.clientWidth` and add that as `paddingRight` on body when locking. Remove on cleanup. Applied to DesignGallery, BookCard, and MusicCard modals.

### Modal navbar hiding (2026-02-16)
Use `body.{name}-modal-open` class (added alongside `overflow:hidden`) to hide the bottom nav via CSS: `opacity: 0; pointer-events: none`. Classes: `design-modal-open`, `book-modal-open`, `music-modal-open`.

### GSAP scrub + entrance animation conflict (2026-02-17)
When an element starts with `style={{ opacity: 0 }}` and has BOTH an entrance `fromTo` animation AND a scroll-scrubbed `gsap.to()`, the scrub tween can record `0` as its starting opacity (since it's created before the entrance runs). Scrolling back to the top then restores the recorded start value — `0` — making the element vanish. **Fix:** (1) Gate the `useGSAP` scroll setup behind `introComplete` via `dependencies: [introComplete]` so the scrub tween is created AFTER the entrance fires. (2) Use `gsap.fromTo()` with explicit start values (`{ opacity: 1, scale: 1 }`) instead of `gsap.to()` so start values never depend on recording timing.

### GSAP scrub + entrance animation conflict (2026-02-17)
When an element starts with `style={{ opacity: 0 }}` and has BOTH an entrance `fromTo` animation AND a scroll-scrubbed `gsap.to()`, the scrub tween can record `0` as its starting opacity (since it's created before the entrance runs). Scrolling back to the top then restores the recorded start value — `0` — making the element vanish. **Fix:** Use `gsap.fromTo()` with explicit start values (`{ opacity: 1, scale: 1 }`) instead of `gsap.to()` so start values never depend on recording timing. Do NOT gate `useGSAP` behind a state variable via `dependencies` — see below.

### `@gsap/react` useGSAP — conditional hook bug with `dependencies` (2026-02-17)
`useGSAP` (v2.1.2) internally has `deferCleanup && useIsomorphicLayoutEffect(...)` — a **conditional hook call**. `deferCleanup` is truthy only when `dependencies` has length > 0. This means passing `dependencies: [someState]` allocates a different number of hooks than having no `dependencies`. In dev mode with HMR, switching between these causes "change in the order of Hooks" errors. **Rule: never add/remove `dependencies` on an existing `useGSAP` call. If you need to react to state changes, handle it inside the callback with early returns or use a separate `useEffect` to set a ref that the `useGSAP` callback reads.**

### Lenis + body position:fixed scroll lock conflict (2026-02-17)
The classic `body { position: fixed; top: -scrollYpx }` pattern for modal scroll locking breaks Lenis. Lenis's internal scroll tracker gets out of sync — on modal close, `window.scrollTo()` fires but Lenis overrides it with its stale target, snapping the user to the wrong section. **Fix:** Use `lenis.stop()` / `lenis.start()` instead. Expose the Lenis instance globally via `window.__lenis` from `SmoothScroll.tsx`.

### Intro → hero transition: overlap, don't sequence (2026-02-17)
The intro screen backdrop dissolve and hero entrance choreography must **overlap**, not run sequentially. If `onComplete` fires at the END of the dissolve, there's a ~1.7s dead gap (text gone → black dissolving → empty white → content pops in). **Fix:** fire `onComplete()` at the START of the dissolve (in the same `useEffect` that triggers the backdrop fade). The hero elements materialize *through* the fading curtain. Also: simplify the backdrop dissolve to a pure `opacity: 0` fade (no `blur(40px)` + `scale(1.08)` which creates a visible "event" rather than a transparent veil lift). Add a tiny `delay: 0.15` on the hero timeline so the veil starts lifting first, then content blooms.

### GSAP ScrollTrigger `pin` + Lenis (2026-02-17)
Pinned sections work with Lenis out of the box — GSAP's ScrollTrigger `pin: true` manipulates element transforms rather than `position: fixed`, so Lenis's virtual scroll stays in sync. Use `pinSpacing: true` (default) so the page layout accounts for the pinned duration. The `overflow: hidden` on the pinned section is important to prevent content leaking during the pin phase.

### `scaleY` is not a valid CSS property for React `style` (2026-02-17)
TypeScript's `CSSProperties` doesn't include GSAP shorthand transforms like `scaleY`. Using `style={{ scaleY: 0 }}` causes TS2353. **Fix:** use `style={{ transform: "scaleY(0)" }}` for the initial state. GSAP's own `.from()` / `.fromTo()` calls can use `{ scaleY: 0 }` since those go through GSAP's property parser, not React's style type.

### `window as Record<string, unknown>` TS strictness (2026-02-17)
TypeScript strict mode doesn't allow `(window as Record<string, unknown>)` because `Window` has an index signature mismatch. **Fix:** double-cast via `(window as unknown as Record<string, unknown>)`.

### model-viewer default progress bar — gray loading bar (2026-02-17)
The `::part(default-progress-bar) { display: none }` CSS approach is unreliable — model-viewer can re-inject or re-style the bar internally. **Bulletproof fix:** slot an empty element as a child: `<span slot="progress-bar" />`. This replaces the default progress bar entirely via the web component's slot mechanism. Keep the CSS `::part()` rule as a belt-and-suspenders fallback. Applied to all 7 model-viewer instances (StatueViewer, DostoevskyBust, OperaDaVinci, JourneyComputer, CraftRedbull, PabulumHelmet, NexusDog).

### 3D model scroll entrance — "Through the Mist" pattern (2026-02-17)
Section 3D models use a GSAP ScrollTrigger entrance: `opacity: 0, scale: 1.08, filter: "blur(18px)"` → `opacity: 1, scale: 1, filter: "blur(0px)"` over 1.2s with `power2.out`. No directional movement (x/y) — pure materialization from fog. This avoids visual conflict with the model's fixed absolute positioning on the right side of each section. `transformOrigin: "center center"` ensures the scale contracts inward symmetrically.

### model-viewer.d.ts — React 19 JSX namespace (2026-02-17)
React 19 with `jsx: "react-jsx"` in `tsconfig.json` uses `React.JSX.IntrinsicElements`, NOT the global `JSX.IntrinsicElements`. The old `declare namespace JSX { ... }` pattern doesn't work — types are silently ignored and every `<model-viewer>` needs `@ts-expect-error`. **Fix:** use `declare module "react" { namespace JSX { interface IntrinsicElements { ... } } }` with `import "react"` at the top to make it an ambient module augmentation. Eliminates all `@ts-expect-error` directives across 7+ components. Also added `interpolation-decay` and `auto-rotate-delay: number | string` to the type.

### 3D model floating animation (2026-02-17)
CSS-only `model-float-inner` class uses `animation: model-float 4.5s ease-in-out infinite` for a gentle 14px up/down bob. Paired with `model-shadow` (a blurred ellipse at the container bottom) that pulses inversely via `model-shadow-pulse` — shadow shrinks as model rises, expands as it falls. Both respect `prefers-reduced-motion`. Each model component wraps `<model-viewer>` in a `<div className="model-float-inner">` and adds a sibling `<div className="model-shadow" />`.

### Design gallery staggered layout via GSAP (2026-02-17)
Design cards use GSAP for staggered `y`-offset reveals instead of CSS `transform: translateY()`. GSAP animates to different `y` end values based on column position (`i % 3` for desktop, `i % 2` for mobile), creating a masonry-like stagger. This avoids CSS/GSAP transform conflicts and lets the stagger animate in naturally as part of the section's assembly choreography.

*Append new findings as they come. Keep entries concise. Date-stamp bug fixes.*

---

## Mobile Responsiveness (2026-02-17)

### Scroll-driven zoom pattern for touch devices
On mobile, `hover` events don't fire. 3D model zoom + dialog interactions gated behind hover are inert on touch. **Fix:** Add a `scrollProgress` prop (0-1) to model-viewer components (`StatueViewer`, `DostoevskyBust`). Use GSAP `ScrollTrigger.create()` with `scrub: 0.3` and `onUpdate` to write progress to a ref + React state. Component derives `effectiveHovered` from `scrollProgress > 0.5` and dialog visibility from `scrollProgress > 0.7`. The hero section gets `min-h-[150vh]` on mobile for scroll runway. The `interpolation-decay="200"` on model-viewer handles smooth camera transitions.

### ScrollTrigger onUpdate + React setState throttling
Calling `setState` on every ScrollTrigger `onUpdate` (which fires ~60fps during scrub) is expensive. **Fix:** Compare against a ref and only update state when delta > 0.02 (`Math.abs(p - ref.current) > 0.02`). Gives ~50 discrete steps which is enough for threshold-based logic.

### Bottom nav centering on mobile
`left: 50%; transform: translateX(-50%)` centers the nav. Must reset to `left: auto; transform: none; right: 4rem` at `min-width: 768px` to restore desktop positioning. Framer Motion's `animate` on the nav applies its own transforms — the CSS `transform: translateX(-50%)` for centering and Framer's transform co-exist because Framer sets `transform` directly via style, which overrides the CSS class. At desktop, `transform: none` in the media query is overridden by Framer anyway. On mobile before Framer hydrates, the CSS centering works. After hydration, Framer takes over. This is fine because Framer's `y: 20, opacity: 0` initial state hides it anyway.

### Side rule hidden on mobile
The side rule (`position: fixed; left: 2rem`) overlaps content on small screens. Use `display: none` by default, `display: flex` at `min-width: 768px`. The GSAP fade still works because it controls `opacity`, not `display`.
