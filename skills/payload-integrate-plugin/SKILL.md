---
name: payload-integrate-plugin
description: Evaluate, install, configure, and verify official Payload plugins and storage adapters with strict package-version alignment and frontend integration. Use when adding SEO, Redirects, Search, Form Builder, Nested Docs, Sentry, Import/Export, MCP, or cloud storage.
---

# Integrate Payload Plugin

Treat a plugin as a cross-cutting schema and runtime change.

## Read First

Read:

1. `docs/payload/00-version-and-sources.md`
2. `docs/payload/03-access-and-security.md`
3. `docs/payload/08-plugin-matrix.md`
4. `docs/payload/09-schema-migrations-and-testing.md`

Read the plugin's current official documentation and its matching `payload/origin/3.x`
source before editing.

## Workflow

1. Confirm the product requirement and verify that a built-in Payload feature does not already solve it.
2. Inspect `package.json`, lockfile, Config, existing plugins, Access, migrations, and deployment environment.
3. Verify an official package exists at the exact Payload core version. Do not install a canary package into stable.
4. Describe the plugin's injected Collections, Fields, Endpoints, Hooks, Admin Components, environment variables, and frontend responsibilities.
5. Install the package only when the user authorized implementation.
6. Keep plugin assembly in `src/plugins/index.ts` when multiple plugins are present.
7. Override default fields and Access explicitly where the project needs different behavior.
8. Implement required frontend consumption; plugin registration alone is not completion.
9. Regenerate types/import map, create a migration if schema changed, and inspect diffs.
10. Test happy path, denied path, disable/uninstall behavior, and production build.

## Plugin-Specific Minimums

- SEO: wire Next metadata and fallback values.
- Redirects: execute redirects in the frontend/server routing layer.
- Search: define synchronized fields and reindex behavior.
- Form Builder: restrict Submission reads and add spam controls.
- Storage: verify URL, Access, deletion, and backup behavior.
- MCP: start read-only, use API Keys, and preserve Payload Access.

## Completion Report

Report package/version, injected surface, Config, frontend integration, environment variables, migration, tests, and rollback path.
