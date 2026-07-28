# ProjectScene Specification

## Overview

- **Target file:** `src/components/ProjectScene.tsx`
- **Screenshot:** `research/design-references/original-desktop-1440.png`
- **Interaction model:** wheel + pointer + hover

## DOM Structure

- `<main class="project-scene">`
  - `<canvas class="webgl-canvas">` managed by Three.js
  - `.project-hover-label` for the pointer-following project title
  - visually hidden ordered project links for keyboard/screen-reader fallback

## Computed Styles

### Scene

- position: `fixed`
- inset: `0`
- min-height: `100svh`
- background: `rgb(0,0,0)`
- overflow: `hidden`
- canvas size: exact viewport size
- renderer: Three.js `WebGLRenderer`, WebGL 2, antialias enabled
- camera: `PerspectiveCamera` calibrated so world units at `z=0` map to CSS pixels
- maximum device pixel ratio: `1.75`

### Initial visible texture cluster

The source initial desktop frame prominently uses manifest indices 33–41:

- 33 Divino Harrogate — deep red foreground panel.
- 34 A Touch Of Ink — charcoal foreground panel.
- 35 Better Angels Ventures — dark panel with three vertical cards.
- 36 XYLO — dominant green `Vision` plane.
- 37 Society Studios — black `Discover Design Deploy Defend` plane.
- 38 The Lodge — white `From Concept to Design` plane.
- 39 Bark — white/green content panel.
- 40 XYLO — green sustainability credentials.
- 41 The Wild Hare — light `The Team` plane.

### Plane styling

- preserve source aspect ratio
- `PlaneGeometry(1,1)` scaled to the manifest aspect ratio
- `MeshBasicMaterial` with the local WebP texture in `SRGBColorSpace`
- transparent edge fade; double-sided raycast target
- depth testing enabled; no artificial light or shadow
- load only the visible neighborhood and dispose stale GPU textures

## States & Behaviors

### Wheel

- Trigger: window `wheel`.
- Prevent normal document scrolling.
- Accumulate a target progress value.
- Interpolate current progress toward target each animation frame.
- Translate queue diagonally; rotate Y/X slightly with depth.

### Pointer parallax

- Trigger: `pointermove`.
- Normalize pointer to `[-1,1]`.
- Apply a small shared X/Y offset and rotation to the Three.js scene group.
- Use `Raycaster` against visible planes to determine the hovered project.

### Project hover

- Trigger: pointer enters a project plane.
- Show the real project title close to the plane/pointer.
- Bring the mesh slightly forward and scale it by approximately `1.012`.
- Clicking a raycast-hit mesh navigates to the original project route.

### Resource lifecycle

- Keep a bounded texture cache around the currently visible 13-plane window.
- Explicitly dispose textures, geometry, materials and the renderer on unmount.
- Handle context loss without throwing and preserve a black page fallback.

## Per-State Content

- Source order and labels come from `public/assets/manifest.json`.
- All 71 project texture records remain in the loop.
- The initial active record remains manifest index `36`.

## Assets

- 71 WebP textures in `public/assets/projects/`.
- Manifest in `public/assets/manifest.json`.

## Responsive Behavior

- Desktop 1440px: cluster occupies approximately right 72% and lower 88%;
  dominant plane width around `33.5vw`.
- Tablet 768px: same perspective with heavier side clipping.
- Mobile 390px: dominant plane width around `128vw`, scene centered farther right,
  with top whitespace reserved for mobile chrome.
- Breakpoint: mobile below `768px`; the exact `768px` viewport retains desktop layout.
