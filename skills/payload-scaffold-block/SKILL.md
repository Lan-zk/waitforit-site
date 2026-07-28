---
name: payload-scaffold-block
description: Create matched Payload Block configs, Lexical feature wiring, frontend React renderers, generated-type handling, and tests. Use when adding reusable page sections or rich-text embedded blocks to this personal site.
---

# Scaffold Payload Block

Keep editor schema and frontend rendering synchronized.

## Read First

Read:

1. `docs/payload/00-version-and-sources.md`
2. `docs/payload/02-content-model.md`
3. `docs/payload/04-data-fetching-and-rendering.md`
4. `docs/payload/09-schema-migrations-and-testing.md`

Inspect the matching Payload 3.x Website Template block and renderer patterns when useful.

## Workflow

1. Inspect existing `src/blocks`, Lexical config, renderer registry, design components, and generated types.
2. Decide whether the requirement belongs in a page `blocks` field, Lexical `BlocksFeature`, or ordinary structured fields.
3. Define the smallest stable Block schema. Give it a unique slug and explicit labels.
4. Create the frontend renderer in the same change.
5. Register the Block in every intended editor and in the central renderer map.
6. Handle nullable fields, relationship depth, media variants, links, and unknown block types safely.
7. Generate types and remove avoidable casts.
8. Test Config generation, representative rendering, missing optional data, and responsive behavior.
9. Run type generation, targeted tests, lint, and build.

## Guardrails

- Do not create a Block solely to avoid writing a normal component.
- Do not place layout-only presentation settings into the content schema unless editors need them.
- Keep Client Components limited to actual interactivity.
- Use official Lexical exports, not internal Lexical types.
- Never register a Config without its renderer or a renderer without its Config.
- Avoid a single catch-all Block with untyped JSON.

## Completion Report

List the Block slug, supported editors, schema, renderer path, generated type, test coverage, and any migration.
