# Gabriel Veres Homepage — Behavior Findings

Source: `https://www.gabrielveres.com/`  
Captured: 2026-07-28

## Interaction model

- The document remains fixed at one viewport (`scrollHeight === innerHeight`).
- A full-viewport WebGL canvas renders a diagonal queue of project textures.
- Mouse-wheel input moves the project queue rather than scrolling the document.
- Pointer position introduces subtle parallax and reveals the title of the project
  under the pointer.
- The scene uses inertial easing; movement continues briefly after wheel input.
- Header and footer remain fixed above the scene.

## Scroll sweep

- Before wheel input: the XYLO `Vision` texture is the dominant central plane.
- After a positive `650px` wheel delta: the queue shifts diagonally and the title
  `Better Angels Ventures` appears when the stationary pointer intersects the
  moved plane.
- There are no document scrollbars or vertical page sections.
- The root `html` element carries a `lenis` class, but the homepage scene consumes
  wheel motion independently of normal document scrolling.

## Hover sweep

- Navigation pills transition from translucent white to lime
  (`#ddfa42`) in `350ms`.
- Link labels use a vertically duplicated text layer; hover slides the first copy
  upward and the second copy into place.
- Project planes show their project title near the pointer while hovered.
- The email link reveals a one-pixel underline from left to right in `250ms`.

## Responsive sweep

### Desktop — 1440 × 1000

- Full navigation is visible at `top: 36px`.
- Container side padding computes to `54.49px`.
- The centered wordmark is `19.34px`, uppercase.
- The footer sits `44px` above the bottom edge.
- The 3D queue occupies the lower-right two-thirds while leaving a large black
  negative-space field on the left.

### Tablet — 768 × 900

- Desktop navigation remains active at the exact `768px` breakpoint.
- The same queue is substantially cropped on both sides.
- Header items can exceed the available width; the source intentionally allows
  the right side to clip.

### Mobile — 390 × 844

- Desktop navigation, wordmark, contact, overview/index controls and footer are
  hidden.
- The current local time remains in the upper-left at approximately
  `left: 27px; top: 47px`.
- The circular starburst mark remains near the upper center-right.
- Project planes become larger relative to the viewport and are aggressively
  cropped, emphasizing the XYLO `Vision` texture.

## Time-driven behavior

- The local-time label updates once per minute and is formatted as
  `HH:MM AM/PM`.

## Known source behavior

- The original uses a custom cursor on desktop.
- Project links resolve to `/projects/<slug>`.
- The overview is an ordered 71-texture loop backed by Sanity project assets.
