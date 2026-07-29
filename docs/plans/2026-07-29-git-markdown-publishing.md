# Git Markdown Publishing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the local end-to-end path from a checked-out Markdown content repository to Payload metadata and readable blog and multi-chapter novel pages.

**Architecture:** The Git repository remains the only Markdown source of truth. A pure filesystem scanner validates the complete `content/` tree before any database write; a trusted local sync command then replaces Payload index metadata, while Next.js resolves only stored repository-relative paths and renders Markdown through a server component. Public asset delivery is restricted to allowlisted files below the content root.

**Tech Stack:** Node.js 24, TypeScript 5.7, Payload 3.86, SQLite, Next.js 16, React 19, `gray-matter`, `react-markdown`, `remark-gfm`, `rehype-sanitize`, Vitest, Playwright.

---

## Data-preservation decision

The local database currently contains exactly the demo records created by `src/utilities/seed.ts`: `posts/first-post` and `novels/the-lodge`. There is no production content in these tables. The schema migration may therefore replace `posts` and `novels`, but its `down` migration must recreate their former schema. The content repository remains the recoverable source for all new writing bodies.

### Task 1: Lock the publishing repository contract with parser tests

**Files:**

- Create: `src/content/types.ts`
- Create: `src/content/errors.ts`
- Create: `src/content/scanContentRepository.ts`
- Create: `tests/int/content-scanner.int.spec.ts`
- Create: `tests/fixtures/content-repo/content/**`

**Steps:**

1. Add fixtures for one GFM blog and one two-chapter short story.
2. Write failing tests for deterministic results, path-derived slugs/order, inherited chapter language, invalid Frontmatter, duplicate chapter order, forbidden symlinks, and ignoring files outside `content/`.
3. Run `npm run test:int -- content-scanner.int.spec.ts` and confirm the tests fail because the scanner does not exist.
4. Implement a scanner that parses the complete tree before returning typed metadata.
5. Run the focused test and confirm it passes.

### Task 2: Add safe content path and asset handling

**Files:**

- Create: `src/content/paths.ts`
- Create: `src/content/readMarkdown.ts`
- Create: `src/app/(frontend)/content-assets/[...segments]/route.ts`
- Test: `tests/int/content-paths.int.spec.ts`

**Steps:**

1. Write failing traversal, absolute-path, symlink, missing-file, and allowlisted-extension tests.
2. Resolve `CONTENT_REPO_ROOT` once, accept only repository-relative paths beginning with `content/`, and verify real paths remain below the real content root.
3. Serve only allowlisted content assets with explicit MIME, CSP, nosniff, and bounded cache headers.
4. Run the focused tests.

### Task 3: Replace shell models with read-only metadata indexes

**Files:**

- Create: `src/collections/Writings.ts`
- Create: `src/collections/Series.ts`
- Modify: `src/payload.config.ts`
- Modify: `src/payload-types.ts` via `npm run generate:types`
- Create: `tests/int/content-model.int.spec.ts`

**Steps:**

1. Add failing tests for anonymous reads, anonymous writes denied, Local API trusted writes, relationships, and chapter ordering.
2. Implement `writings` and `series` with no body, drafts, versions, or localized author fields.
3. Register the new collections and remove `posts` and `novels` from the active config.
4. Generate types and inspect the diff.
5. Run focused model tests.

### Task 4: Synchronize validated metadata

**Files:**

- Create: `src/content/syncContent.ts`
- Create: `scripts/sync-content.ts`
- Modify: `package.json`
- Test: `tests/int/content-sync.int.spec.ts`

**Steps:**

1. Write failing tests for create, update, delete, stable series relationships, and validation-before-write.
2. Implement a trusted Local API sync that validates the full repository before writing, upserts series before chapters, and deletes stale writings before stale series.
3. Add `npm run content:sync`.
4. Run sync tests against an isolated local SQLite database.

### Task 5: Render Markdown and public reading routes

**Files:**

- Create: `src/components/MarkdownRenderer.tsx`
- Create: `src/components/MarkdownRenderer.module.css`
- Modify: `src/components/ContentPage.tsx`
- Modify: `src/components/ContentPage.module.css`
- Modify: `src/app/(frontend)/blog/page.tsx`
- Modify: `src/app/(frontend)/blog/[slug]/page.tsx`
- Modify: `src/app/(frontend)/novel/page.tsx`
- Modify: `src/app/(frontend)/novel/[seriesSlug]/page.tsx`
- Create: `src/app/(frontend)/novel/[seriesSlug]/[chapterSlug]/page.tsx`
- Modify: `src/i18n/dictionaries.ts`

**Steps:**

1. Add component tests for GFM, sanitized HTML, external-link safety, and relative image rewriting.
2. Render blog and novel metadata from Payload, then read Markdown only through the safe path utility.
3. Keep fixed UI bilingual while applying the author’s `language` to article content.
4. Implement 404 behavior for missing metadata or files.
5. Verify desktop and `390x844` layouts.

### Task 6: Preserve homepage behavior and local seed workflow

**Files:**

- Modify: `src/utilities/getManifest.ts`
- Modify: `src/utilities/seed.ts`
- Modify: `.env.example`

**Steps:**

1. Remove old `posts` and `novels` seed writes.
2. Include indexed blog and series cover files in the homepage manifest without changing `ProjectScene.tsx`.
3. Document `CONTENT_REPO_ROOT`.
4. Run the scene regression.

### Task 7: Create and audit the migration

**Files:**

- Create: `src/migrations/<timestamp>_replace_posts_novels_with_writings_series.ts`
- Create or modify: `src/migrations/index.ts`

**Steps:**

1. Generate a descriptively named Payload migration after the model is stable.
2. Review `up` for new tables, indexes, relationships, and removal of demo tables.
3. Review `down` for recreation of the old table shapes.
4. Apply `up` and `down` only to disposable local database copies, never production.

### Task 8: Full local verification and progress update

**Files:**

- Modify: `PROGRESS.md`
- Modify: relevant integration and Playwright tests

**Steps:**

1. Run `npm run lint`.
2. Run `npm run generate:types` and ensure there is no unreviewed generated drift.
3. Run `npm run test:int`.
4. Run `npm run build`.
5. Run `npm run test:e2e` with one worker if local resource contention recurs.
6. Record exact outcomes, unresolved risks, schema strategy, and milestone status in `PROGRESS.md`.
7. Audit every M1–M4 local completion condition against code, database, and browser evidence.

## Execution mode

The user explicitly requested implementation in the current task and local-only verification. Codex will execute this plan sequentially in the current worktree without deployment, server access, staging, or commits.
