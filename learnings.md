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
The 3D model sits at `z-index: 15` (inline style). Any overlay that should appear *above* the model (like the glass dialog) must use a higher z-index. The glass dialog uses `z-20` (Tailwind) = z-index 20.

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

*Append new findings as they come. Keep entries concise. Date-stamp bug fixes.*
