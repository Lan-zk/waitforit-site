---
name: payload-model-content
description: Design and implement typed Payload Collections, Globals, fields, relationships, access rules, and matching tests for this personal site. Use when adding or materially changing content types such as posts, projects, tags, pages, navigation, footer, or site settings.
---

# Model Payload Content

Create one coherent content feature from schema through verification.

## Read First

Read these project references completely before editing:

1. `docs/payload/00-version-and-sources.md`
2. `docs/payload/02-content-model.md`
3. `docs/payload/03-access-and-security.md`
4. `docs/payload/09-schema-migrations-and-testing.md`

Read `docs/payload/05-publishing-and-preview.md` when the model is publishable.

## Workflow

1. Inspect `package.json`, `src/payload.config.ts`, existing Collections, Globals, generated types, tests, and migrations.
2. Confirm whether the requirement is a Collection, Global, reusable Field, or Block. Do not introduce a generic Page Builder when structured fields satisfy the requirement.
3. Write a short model contract covering slug, ownership, public visibility, fields, relationships, indexes, drafts, and deletion behavior.
4. Reuse existing Access and Field helpers. Add project helpers only when at least two configs need the same behavior.
5. Implement the Config in its own module and register it centrally.
6. Add only the minimum frontend query or renderer required for the feature.
7. Generate types and inspect the generated diff.
8. Use `$payload-manage-schema-change` for migration work.
9. Add integration tests for CRUD, relationships, Access allow/deny, and draft behavior.
10. Run the narrowest relevant checks, then `npm run check`.

## Guardrails

- Target the exact Payload version in `package.json`.
- Prefer the matching `payload/origin/3.x` source over `main`.
- Keep public reads limited to published documents.
- Do not expose full `users` documents through public relationships.
- Use `select`/`defaultPopulate` for list-facing relationships.
- Index slugs and frequent sort/filter fields.
- Do not make unrelated schema or UI changes.
- Do not create a migration until the model is stable enough to preserve.

## Completion Report

Report:

- model and relationship decisions
- Access matrix
- created or changed files
- generated type and migration impact
- tests and commands run
- unresolved product decisions
