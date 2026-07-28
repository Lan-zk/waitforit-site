# Gabriel Veres Homepage — Page Topology

All layers are fixed inside a single `100svh` black viewport.

1. **ProjectScene** — full-screen interactive 3D texture queue.
   - Interaction: wheel, pointer movement, hover.
   - Visual depth: project planes overlap with perspective and subtle borders.
2. **TopGradientOverlay** — fixed, pointer-transparent, 15% viewport height.
   - Background:
     `linear-gradient(0deg, rgba(1,1,1,0) 15.2%, rgba(1,1,1,.5) 51%, rgba(0,0,0,.85) 84.8%)`
   - z-index: `1990`.
3. **BottomGradientOverlay** — fixed, pointer-transparent, 15% viewport height.
   - Background:
     `linear-gradient(0deg, rgba(0,0,0,.85) 9.5%, rgba(1,1,1,.5) 51%, rgba(1,1,1,0) 84.8%)`
   - z-index: `1990`.
4. **SiteHeader** — fixed above the scene.
   - Desktop: starburst, Work/About/Blog, centered wordmark, Contact and time/globe.
   - Mobile: local time and starburst only.
   - z-index: `2000`.
5. **SceneControls** — fixed near lower corners.
   - Desktop only: `Overview` label and `Index` link.
6. **SiteFooter** — fixed `44px` from desktop bottom.
   - Desktop only: `office@humanist.ro`.
   - z-index: `1991`.

Dependencies:

- `SiteHeader` and `SiteFooter` share typography, glass and container tokens.
- `ProjectScene` reads `public/assets/manifest.json`.
- Every plane uses a locally downloaded Sanity texture.
- Header, overlays and footer must remain independent of scene transforms.
