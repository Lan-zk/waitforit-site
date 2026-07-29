# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is the site owner, who uses the product as a durable personal
knowledge and publishing system.

Public audiences are:

- ordinary readers who come to read the owner's long-term writing;
- people evaluating the owner through the résumé and published work, including
  potential employers or collaborators.

## Product Purpose

Wait For It exists to turn selected knowledge and writing maintained by the
owner into a long-lived public personal site. Its primary public outcome is
sustained reading; its secondary outcome is helping visitors understand the
owner through the résumé, writing, projects, and later photography.

Success means the owner can maintain and publish the site over time without
turning it into a marketing system or duplicating the source of truth for
written content.

## Positioning

Wait For It joins a private, owner-controlled knowledge practice with a public
personal publication: writing is developed in Obsidian, selected public
Markdown is versioned in a separate private Git repository, Payload indexes the
content and manages site data, and Next.js presents it through a distinctive
personal-site entry point.

It is not a general-purpose publishing platform, a collaborative CMS, or a
replacement for Obsidian.

## Operating Context

- Knowledge is formed and maintained by the owner in Obsidian.
- Content selected for publication is committed to the default branch of a
  private Git repository.
- Everything under that repository's `content/` directory is considered public;
  Git provides author-controlled history and rollback.
- The deployed site reads Markdown from a read-only Git working directory while
  Payload stores metadata, relationships, routing identifiers, media metadata,
  and other site-managed content.
- Payload Admin is used for site-managed data, not for editing or writing back
  Git Markdown.
- The current deployment baseline is a personal server using Docker, SQLite, and
  persistent local media.

## Capabilities and Constraints

- The public site supports Simplified Chinese (`zh-CN`, default) and English
  (`en`) interface copy. Editor-authored content remains in its original
  language.
- The homepage is a Payload-driven Three.js/WebGL scene and remains the default
  visual entry point rather than being replaced by a conventional content
  index.
- Public content includes blog posts and multi-chapter short fiction. Résumé,
  project, and photography surfaces are also part of the product, although the
  résumé content structure and the full project and photography experiences are
  not yet complete.
- Markdown publication supports standard Markdown, GFM, YAML frontmatter, and
  controlled relative image assets. It does not execute MDX, article JavaScript,
  or raw HTML.
- The first-stage publishing model has one owner, no drafts or approval
  workflow, and no collaborative editing, automatic rollback, scheduled
  publishing, comments, subscriptions, or membership.
- Search, tags, RSS, full SEO, and analytics are explicitly deferred.
- Current technical baselines are Payload CMS 3.86, Next.js 16.2, React 19.2,
  Node.js 24, and SQLite.
- Production deployment and server hardening remain incomplete.
- The final résumé information architecture and the scope of downloadable or
  print résumé support are open decisions.

## Brand Commitments

- Product and site name: **Wait For It**.
- Public domain: **waitforit.cn**.
- The bilingual Simplified Chinese and English public interface is a lasting
  commitment.
- The WebGL homepage is a lasting part of the site's identity and primary entry
  experience.
- The product is a personal publication and identity surface, not a separate
  marketing system.

## Evidence on Hand

- Product priorities and durable architecture decisions:
  `PROGRESS.md`.
- Current runtime and dependency contract: `package.json` and
  `package-lock.json`.
- Payload content and site-data registration: `src/payload.config.ts`.
- Existing homepage experience: `src/app/(frontend)/page.tsx` and
  `src/components/ProjectScene.tsx`.
- Existing writing and reading flows: `src/app/(frontend)/blog/`,
  `src/app/(frontend)/novel/`, `src/components/MarkdownRenderer.tsx`, and
  `src/components/PublishingList.tsx`.
- Existing résumé shell and rich-text renderer:
  `src/app/(frontend)/resume/page.tsx` and
  `src/components/RichTextRenderer.tsx`.
- Public localization contract: `src/i18n/`.
- Browser evidence covers the WebGL scene, bilingual interface, publishing
  flows, keyboard behavior, non-WebGL fallback, and a `390x844` mobile viewport
  under `tests/e2e/`.
- The adjacent private publishing repository currently provides test blog and
  short-fiction fixtures. Finished résumé copy, production photography, public
  testimonials, audience metrics, and performance claims are not established
  and must not be fabricated.

## Product Principles

1. Serve the owner's long-term knowledge and publishing practice first while
   keeping the public reading experience coherent.
2. Let sustained writing lead the public experience, then help readers
   understand the person behind it.
3. Preserve one authoritative source for each kind of content and keep
   publication owner-controlled and recoverable.
4. Maintain the WebGL entry point and bilingual interface as durable product
   commitments.
5. Prefer a maintainable, self-hosted personal system over speculative growth,
   collaboration, or marketing machinery.

## Accessibility & Inclusion

- Fixed interface copy, navigation, empty states, and controls must work in both
  Simplified Chinese and English.
- Unknown or malformed locale values fall back to Simplified Chinese.
- Public navigation and language selection must remain keyboard accessible with
  visible focus and selected state.
- The homepage must preserve reduced-motion handling and an accessible project
  link fallback when WebGL is unavailable.
- No specific conformance standard beyond these established requirements has
  been confirmed.
