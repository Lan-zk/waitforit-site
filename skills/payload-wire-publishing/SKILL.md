---
name: payload-wire-publishing
description: Add and verify Payload drafts, versions, preview routes, live preview, scheduled publishing, published access, metadata, redirects, and Next.js cache revalidation. Use when a Collection or Global needs an editorial publishing workflow.
---

# Wire Payload Publishing

Build the complete editorial path instead of enabling drafts in isolation.

## Read First

Read:

1. `docs/payload/03-access-and-security.md`
2. `docs/payload/04-data-fetching-and-rendering.md`
3. `docs/payload/05-publishing-and-preview.md`
4. `docs/payload/06-hooks-jobs-transactions.md`
5. `docs/payload/08-plugin-matrix.md`

## Workflow

1. Inspect the target Config, public query, route, metadata generation, cache strategy, and existing preview endpoints.
2. Define published visibility, autosave interval, version retention, scheduling need, and slug-change behavior.
3. Add versions/drafts and `publishedAt` handling.
4. Enforce authenticated-or-published Access.
5. Implement a protected Preview Route and draft-aware Local API query.
6. Configure Preview and Live Preview URLs from trusted server data.
7. Add targeted revalidation for create, publish, update, slug change, and delete.
8. Integrate SEO and Redirects only if the corresponding official plugin is installed or authorized for installation.
9. Configure a real schedule handler and worker before claiming scheduled publishing works.
10. Test anonymous draft denial, editor preview, publish, unpublish/delete, slug change, metadata, and cache invalidation.

## Guardrails

- Never expose draft mode through an unauthenticated route.
- Never cache draft responses in the public cache.
- Do not overwrite the original publication date on every update.
- Do not run expensive content processing synchronously in revalidation Hooks.
- Do not enable schedule publishing without an execution mechanism.

## Completion Report

Report the publishing state machine, preview security, cache invalidation map, worker requirement, plugin dependencies, and test results.
