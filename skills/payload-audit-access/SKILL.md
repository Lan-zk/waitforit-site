---
name: payload-audit-access
description: Perform a read-only security audit of Payload authentication, Collection/Global/Field Access, Local API override behavior, uploads, public forms, Jobs, plugin endpoints, and MCP capabilities. Use before exposing data, deploying, or reviewing a security-sensitive change.
---

# Audit Payload Access

Diagnose and report. Do not implement fixes unless the user separately requests them.

## Read First

Read:

1. `docs/payload/00-version-and-sources.md`
2. `docs/payload/03-access-and-security.md`
3. `docs/payload/07-media-and-storage.md`
4. `docs/payload/08-plugin-matrix.md`

## Audit Procedure

1. Inventory auth-enabled Collections, roles, public routes, Collections, Globals, Field Access, custom Endpoints, Jobs endpoints, upload handlers, and plugins.
2. Build an operation matrix for create/read/update/delete and relevant auth operations.
3. Find Local API calls reachable from requests and verify user-scoped calls set `overrideAccess: false` or pass a trusted `req`.
4. Check that anonymous public content is constrained to published documents.
5. Check that public forms allow only intended creation and protect stored submissions.
6. Check user fields, internal notes, secrets, generated values, and API Keys at Field level.
7. Check media direct URLs, cloud-storage bypass settings, MIME/size controls, and private derivatives.
8. Check Preview Routes, cron endpoints, Import/Export, and MCP capability/API Key boundaries.
9. Compare test coverage to every allow and deny rule.
10. Report findings with exact file and line, severity, exploit precondition, impact, and recommended fix.

## Severity

- P0: direct secret exposure, unauthenticated privileged mutation, or remote code execution
- P1: private data exposure, Access bypass, unrestricted upload, or leaked draft
- P2: missing defense-in-depth, weak auditability, or unsafe operational default
- P3: maintainability issue with limited direct security impact

## Guardrails

- Treat all assumptions as unverified.
- Do not infer security from Admin UI visibility.
- Do not claim a vulnerability without a reachable path.
- Do not expose secrets or production data in the report.
- Do not mutate code, data, keys, or external systems during an audit.
