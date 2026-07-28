---
name: payload-manage-schema-change
description: Implement and verify Payload schema changes with generated types, SQLite migrations, data-preservation checks, integration tests, and deployment notes. Use when adding, removing, renaming, or changing fields, relationships, Collections, Globals, or schema-injecting plugins.
---

# Manage Payload Schema Change

Preserve data and keep Config, generated types, migrations, tests, and deployment synchronized.

## Read First

Read:

1. `docs/payload/00-version-and-sources.md`
2. `docs/payload/02-content-model.md`
3. `docs/payload/09-schema-migrations-and-testing.md`
4. `docs/DEPLOYMENT.md`

## Workflow

1. Inspect the existing Config, generated types, migrations, test fixtures, SQLite setup, and deployment commands.
2. Classify the change as additive, rename, type conversion, relationship change, required-field change, or destructive removal.
3. State the data-preservation strategy before editing. Ask for direction if production data assumptions materially change the approach.
4. Modify Config with the narrowest compatible change.
5. Run `npm run generate:types` and inspect the generated diff.
6. Validate behavior against the development database.
7. Generate a descriptively named migration.
8. Review and correct `up` and `down`; never accept a destructive rename as drop-and-add without explicit intent.
9. Add data backfill or phased rollout when introducing required values.
10. Add integration tests and run `npm run check`.
11. Document backup, migration order, rollback limits, and media implications.

## Guardrails

- Never run a migration against production without explicit authorization.
- Never delete production data as an inferred implementation detail.
- Back up SQLite and media as one release unit.
- Do not hand-edit generated types.
- Do not generate a migration for an exploratory model that is still changing.
- Keep unrelated generated noise out of the change.

## Completion Report

Report the schema delta, data strategy, type diff, migration path, rollback behavior, tests, and deployment sequence.
