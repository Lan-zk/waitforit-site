# Gabriel Veres homepage study

An isolated Next.js reconstruction of `https://www.gabrielveres.com/`.

## Run

```powershell
pnpm install --registry=https://registry.npmmirror.com
pnpm run dev
```

Open `http://localhost:3000`.

## Verify

```powershell
pnpm run typecheck
pnpm run build
```

## Contents

- `research/` — behavior notes, topology, exact component specifications and
  reference screenshots.
- `public/assets/projects/` — 71 locally downloaded project textures.
- `public/assets/manifest.json` — source order, titles, slugs and dimensions.
- `src/components/ProjectScene.tsx` — Three.js WebGL scene with bounded texture
  caching, wheel navigation, pointer parallax and raycast interactions.
- `src/components/` — isolated site chrome and visual layer components.

This implementation is a visual study. Original project imagery, names and brand
assets remain the property of their respective owners.
