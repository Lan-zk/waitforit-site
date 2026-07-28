# waitforit-site Agent Guide

## Mission and current state

This repository is a personal publishing site built with Payload CMS and Next.js.
Payload owns the content model, Admin UI, authentication, APIs, SQLite data, and
media metadata. Next.js renders the public site. The homepage is a Three.js/WebGL
scene fed by live Payload content.

Current baseline:

- Node.js `24.x`, npm `11.x`
- Payload and all `@payloadcms/*` packages `3.86.0`
- Next.js `16.2.12`, React `19.2.6`
- SQLite for local development and the current self-hosted baseline
- Lexical rich text and local media storage
- Collections: `users`, `media`, `projects`, `posts`, `novels`, `photography`
- Globals: `resume`, `site-settings`, `header`, `footer`
- Public UI locales: Simplified Chinese (`zh-CN`, default) and English (`en`)
- Detail pages are still phase-one shells; do not describe them as finished content

`README.md`, `docs/ARCHITECTURE.md`, and `docs/payload/INDEX.md` may contain older
baseline descriptions. Verify current behavior from code, `package.json`,
`PROGRESS.md`, and tests before repeating those descriptions.

## Read before changing code

Always inspect:

1. `package.json` and `package-lock.json`
2. `src/payload.config.ts`
3. the relevant Collection, Global, frontend route, utility, and test
4. `docs/payload/00-version-and-sources.md`
5. the task-specific document under `docs/payload/`
6. the matching project skill under `skills/`

Evidence priority:

1. this repository's package and lock files
2. installed Payload 3.86 TypeScript types
3. matching `payload/origin/3.x` source and tests
4. current official Payload or Next.js documentation
5. canary/main source only as clearly labelled forward-looking evidence

Use live official sources for version-sensitive claims. Do not copy Payload 4
canary APIs into this Payload 3.86 project.

## Project skill router

The skills in `skills/` are development procedures, not runtime packages.

- Content types, Globals, fields, and relationships:
  `skills/payload-model-content/SKILL.md`
- Blocks, Lexical registration, and paired renderers:
  `skills/payload-scaffold-block/SKILL.md`
- Drafts, preview, live preview, publishing, and revalidation:
  `skills/payload-wire-publishing/SKILL.md`
- Official plugins and storage adapters:
  `skills/payload-integrate-plugin/SKILL.md`
- Read-only access and exposure reviews:
  `skills/payload-audit-access/SKILL.md`
- Any schema change, including localized Payload fields:
  `skills/payload-manage-schema-change/SKILL.md`
- Payload, Next.js, React, adapter, or plugin upgrades:
  `skills/payload-check-upgrade/SKILL.md`

Use `skills/INDEX.md` for combinations. An audit request is read-only unless the
user separately authorizes fixes. An upgrade assessment must not silently edit
dependencies.

## Architecture and boundaries

- Keep one Collection or Global per module and register it in
  `src/payload.config.ts`.
- Prefer Payload Local API in Server Components, Route Handlers, and Hooks.
- Browser and external clients use REST or GraphQL.
- Client Components must not initialize Payload.
- Keep list queries narrow with `select`, low `depth`, bounded limits, and indexed
  sort/filter fields.
- Local API defaults to `overrideAccess: true`. For user-scoped or public-request
  operations that must honor Access, set `overrideAccess: false` and pass the
  trusted `req` or user.
- Admin UI visibility is not authorization. Enforce Access and Field Access on the
  server, and test both allow and deny paths.
- Keep uploads validated, require meaningful alt text for content images, and
  back up SQLite plus media as one release unit.
- Pass the original Payload `req` through related Hook operations to preserve
  transactions. Put slow or retryable work in Jobs rather than request-blocking
  Hooks.

Do not hand-edit:

- `src/payload-types.ts`; regenerate it with `npm run generate:types`
- generated files in `src/app/(payload)/`

Treat these as reference/specification areas unless a documentation task explicitly
targets them:

- `docs/gabrielveres/`
- `docs/payload/`

The Three.js scene in `src/components/ProjectScene.tsx` is a fidelity-sensitive
port. Do not change camera tables, geometry, texture lifecycle, the `768px`
breakpoint, raycasting, or disposal behavior unless the task explicitly targets
the scene and includes browser regression coverage.

## Internationalization contract

- Supported public UI locales are `zh-CN` and `en`; default to `zh-CN`.
- Keep locale parsing, cookie naming, and dictionaries in `src/i18n/`.
- Unknown or malformed locale values must fall back to `zh-CN`.
- The root `<html lang>` value, metadata, navigation labels, controls, empty
  states, and fixed page copy must use the resolved locale.
- The language control must be keyboard accessible and expose its selected state.
- Do not translate editor-authored Payload values implicitly. Adding localized
  Payload fields is a schema change: use `payload-model-content` plus
  `payload-manage-schema-change`, define fallback behavior, regenerate types,
  create and review a migration, and plan data backfill.
- Prefer logical CSS properties and flexible text containers. Do not assume English
  text length or fixed-width labels.

## Schema-change contract

For every Collection, Global, Field, relationship, localization config, or
schema-injecting plugin change:

1. classify the change and state how existing data is preserved
2. edit the narrowest Config surface
3. run `npm run generate:types` and inspect the generated diff
4. validate reads and writes against a development database
5. create a descriptively named migration when the model is stable
6. review both `up` and `down`, especially renames and required fields
7. add integration and browser coverage
8. run `npm run check`

Never run production migrations without explicit authorization. Back up database
and media together before deployment.

## Local workflow

```bash
npm ci
cp .env.example .env
mkdir -p data media
npm run dev
```

The development server is expected at `http://localhost:3000`; Admin is at
`/admin`.

The local demo seed is:

```bash
npx tsx src/utilities/seed.ts
```

Stop the development server before running the seed in a fresh database. Two
Payload processes can race while pushing the SQLite development schema. The seed
is local-only and must never be pointed at production implicitly.

## Verification and completion

Use the narrowest checks while iterating, then run the complete relevant chain:

```bash
npm run lint
npm run generate:types
npm run test:int
npm run build
npm run test:e2e
```

`npm run check` covers lint, generated types, integration tests, and production
build. It does not replace browser verification of the WebGL scene, language
switching, Admin workflows, media delivery, or Access denial paths.

For frontend changes, verify at least:

- default Simplified Chinese and English switching
- preference persistence and invalid-locale fallback
- desktop and `390x844` mobile layouts
- keyboard operation and visible focus
- empty data and 404 behavior
- no browser console errors
- canvas/WebGL scene still initializes and responds to input

Report exact commands and results. Distinguish code/config evidence, automated
tests, and behavior actually observed in a browser. Preserve unrelated worktree
changes; do not stage, commit, reset, or clean without explicit authorization.
