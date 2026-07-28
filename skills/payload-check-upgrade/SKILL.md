---
name: payload-check-upgrade
description: Assess Payload core, official plugin, Next.js, React, database-adapter, rich-text, and Node compatibility before an upgrade. Use when considering dependency updates, reading canary source, resolving package mismatch, or planning a Payload 3 to 4 migration.
---

# Check Payload Upgrade

Produce an evidence-backed upgrade assessment before changing dependencies.

## Read First

Read:

1. `docs/payload/00-version-and-sources.md`
2. `docs/payload/01-architecture.md`
3. `docs/payload/08-plugin-matrix.md`
4. `docs/payload/09-schema-migrations-and-testing.md`

## Workflow

1. Read `package.json`, lockfile, Node engine, Next config, Payload config, adapters, plugins, custom Admin Components, Lexical features, migrations, and CI.
2. Query current npm dist-tags and official compatibility requirements live.
3. Compare the installed version to the exact target tag or matching source branch. Do not compare stable implementation directly to an arbitrary `main` commit.
4. Identify breaking changes in Config types, database schema, generated types, import maps, Admin components, plugins, storage, and deployment.
5. Verify that every `payload` and `@payloadcms/*` package has a compatible target version.
6. Separate required migration work from optional new features.
7. Produce a staged plan: dependency-only branch, type/import-map regeneration, migration, tests, then feature adoption.
8. Do not edit dependencies unless the user explicitly asks to execute the upgrade.

## Required Output

Include:

- current and target version matrix
- authoritative sources and retrieval date
- incompatible or uncertain APIs
- schema/migration risk
- plugin compatibility
- test and rollback plan
- go/no-go recommendation with confidence

## Guardrails

- Never assume official docs describe the installed major version.
- Never mix stable and canary packages.
- Never use a green build as the only migration proof.
- Flag missing production backup or rollback information as a blocker to deployment, not necessarily to local experimentation.
