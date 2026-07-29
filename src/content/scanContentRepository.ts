import { lstat, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'

import {
  ContentRepositoryError,
  type ContentRepositoryIssue,
} from './errors'
import type {
  BlogMetadata,
  ChapterMetadata,
  ContentRepositoryScan,
  SeriesMetadata,
} from './types'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const languagePattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/
const chapterFilenamePattern = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/

const commonFrontmatterFields = new Set([
  'cover',
  'language',
  'publishedAt',
  'summary',
  'title',
])

interface ParsedFrontmatter {
  cover?: string
  language?: string
  publishedAt?: string
  summary?: string
  title: string
}

function toRepositoryPath(...segments: string[]) {
  return segments.join('/')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function optionalString(
  data: Record<string, unknown>,
  field: string,
  sourcePath: string,
  issues: ContentRepositoryIssue[],
) {
  const value = data[field]
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') {
    issues.push({
      path: sourcePath,
      reason: `Frontmatter field "${field}" must be a string.`,
    })
    return undefined
  }
  return value.trim()
}

function parsePublishedAt(
  value: unknown,
  sourcePath: string,
  issues: ContentRepositoryIssue[],
) {
  if (value === undefined || value === null || value === '') return undefined

  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.valueOf())) {
    issues.push({
      path: sourcePath,
      reason: 'Frontmatter field "publishedAt" must be a valid ISO 8601 date.',
    })
    return undefined
  }
  return date.toISOString()
}

function validateFrontmatter(
  value: unknown,
  sourcePath: string,
  issues: ContentRepositoryIssue[],
  options: { languageRequired: boolean; chapter: boolean },
): ParsedFrontmatter | null {
  if (!isRecord(value)) {
    issues.push({
      path: sourcePath,
      reason: 'Frontmatter must be a YAML object.',
    })
    return null
  }

  const allowedFields = options.chapter
    ? new Set(['title'])
    : commonFrontmatterFields
  for (const field of Object.keys(value)) {
    if (!allowedFields.has(field)) {
      issues.push({
        path: sourcePath,
        reason: `Unknown Frontmatter field "${field}".`,
      })
    }
  }

  const title = optionalString(value, 'title', sourcePath, issues)
  if (!title) {
    issues.push({
      path: sourcePath,
      reason: 'Frontmatter field "title" is required.',
    })
  }

  const language = options.chapter
    ? undefined
    : optionalString(value, 'language', sourcePath, issues)
  if (options.languageRequired && !language) {
    issues.push({
      path: sourcePath,
      reason: 'Frontmatter field "language" is required.',
    })
  } else if (language && !languagePattern.test(language)) {
    issues.push({
      path: sourcePath,
      reason: 'Frontmatter field "language" must be a valid language tag.',
    })
  }

  if (!title) return null

  return {
    cover: options.chapter
      ? undefined
      : optionalString(value, 'cover', sourcePath, issues),
    language,
    publishedAt: options.chapter
      ? undefined
      : parsePublishedAt(value.publishedAt, sourcePath, issues),
    summary: options.chapter
      ? undefined
      : optionalString(value, 'summary', sourcePath, issues),
    title,
  }
}

async function parseMarkdownFrontmatter(
  repositoryRoot: string,
  sourcePath: string,
  issues: ContentRepositoryIssue[],
  options: { languageRequired: boolean; chapter: boolean },
) {
  const absolutePath = path.join(repositoryRoot, ...sourcePath.split('/'))
  let stats
  try {
    stats = await lstat(absolutePath)
  } catch {
    issues.push({
      path: sourcePath,
      reason: 'Required Markdown file does not exist.',
    })
    return null
  }

  if (stats.isSymbolicLink()) {
    issues.push({
      path: sourcePath,
      reason: 'Symbolic links are not allowed in publishable content.',
    })
    return null
  }
  if (!stats.isFile()) {
    issues.push({
      path: sourcePath,
      reason: 'Expected a Markdown file.',
    })
    return null
  }

  let parsed
  try {
    parsed = matter(await readFile(absolutePath, 'utf8'))
  } catch (error) {
    issues.push({
      path: sourcePath,
      reason: `Invalid YAML Frontmatter: ${
        error instanceof Error ? error.message : 'Unknown parsing error.'
      }`,
    })
    return null
  }

  return validateFrontmatter(parsed.data, sourcePath, issues, options)
}

async function resolveCoverPath(
  repositoryRoot: string,
  markdownPath: string,
  cover: string | undefined,
  issues: ContentRepositoryIssue[],
) {
  if (!cover) return undefined
  if (path.posix.isAbsolute(cover) || /^[A-Za-z]:[\\/]/.test(cover)) {
    issues.push({
      path: markdownPath,
      reason: 'Frontmatter field "cover" must be a relative path.',
    })
    return undefined
  }

  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(markdownPath), cover),
  )
  if (
    resolved === 'content' ||
    !resolved.startsWith('content/') ||
    resolved.includes('/../')
  ) {
    issues.push({
      path: markdownPath,
      reason: 'Frontmatter field "cover" must remain inside content/.',
    })
    return undefined
  }

  const absolutePath = path.join(repositoryRoot, ...resolved.split('/'))
  try {
    const stats = await lstat(absolutePath)
    if (stats.isSymbolicLink()) {
      issues.push({
        path: resolved,
        reason: 'Symbolic links are not allowed in publishable content.',
      })
      return undefined
    }
    if (!stats.isFile()) throw new Error('not a file')
  } catch {
    issues.push({
      path: resolved,
      reason: `Referenced cover for "${markdownPath}" does not exist.`,
    })
    return undefined
  }

  return resolved
}

async function listDirectories(
  absolutePath: string,
  repositoryPath: string,
  issues: ContentRepositoryIssue[],
) {
  let entries
  try {
    entries = await readdir(absolutePath, { withFileTypes: true })
  } catch {
    return []
  }

  const directories: string[] = []
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name, 'en'),
  )) {
    const entryPath = toRepositoryPath(repositoryPath, entry.name)
    if (entry.isSymbolicLink()) {
      issues.push({
        path: entryPath,
        reason: 'Symbolic links are not allowed in publishable content.',
      })
    } else if (entry.isDirectory()) {
      directories.push(entry.name)
    }
  }
  return directories
}

async function scanBlogs(
  repositoryRoot: string,
  issues: ContentRepositoryIssue[],
) {
  const blogsRoot = path.join(repositoryRoot, 'content', 'blog')
  const directories = await listDirectories(
    blogsRoot,
    'content/blog',
    issues,
  )
  const blogs: BlogMetadata[] = []

  for (const slug of directories) {
    const sourcePath = toRepositoryPath('content', 'blog', slug, 'index.md')
    if (!slugPattern.test(slug)) {
      issues.push({
        path: toRepositoryPath('content', 'blog', slug),
        reason: 'Blog directory must be a lowercase kebab-case slug.',
      })
      continue
    }
    const frontmatter = await parseMarkdownFrontmatter(
      repositoryRoot,
      sourcePath,
      issues,
      { chapter: false, languageRequired: true },
    )
    if (!frontmatter?.language) continue

    blogs.push({
      coverPath: await resolveCoverPath(
        repositoryRoot,
        sourcePath,
        frontmatter.cover,
        issues,
      ),
      kind: 'blog',
      language: frontmatter.language,
      publishedAt: frontmatter.publishedAt,
      slug,
      sourcePath,
      summary: frontmatter.summary,
      title: frontmatter.title,
    })
  }

  return blogs
}

async function scanSeries(
  repositoryRoot: string,
  issues: ContentRepositoryIssue[],
) {
  const novelsRoot = path.join(repositoryRoot, 'content', 'novels')
  const directories = await listDirectories(
    novelsRoot,
    'content/novels',
    issues,
  )
  const series: SeriesMetadata[] = []
  const chapters: ChapterMetadata[] = []

  for (const slug of directories) {
    const directoryPath = toRepositoryPath('content', 'novels', slug)
    if (!slugPattern.test(slug)) {
      issues.push({
        path: directoryPath,
        reason: 'Novel directory must be a lowercase kebab-case slug.',
      })
      continue
    }

    const sourcePath = toRepositoryPath(directoryPath, 'index.md')
    const frontmatter = await parseMarkdownFrontmatter(
      repositoryRoot,
      sourcePath,
      issues,
      { chapter: false, languageRequired: true },
    )
    if (!frontmatter?.language) continue

    series.push({
      coverPath: await resolveCoverPath(
        repositoryRoot,
        sourcePath,
        frontmatter.cover,
        issues,
      ),
      language: frontmatter.language,
      publishedAt: frontmatter.publishedAt,
      slug,
      sourcePath,
      summary: frontmatter.summary,
      title: frontmatter.title,
    })

    const absoluteDirectory = path.join(
      repositoryRoot,
      'content',
      'novels',
      slug,
    )
    const entries = (
      await readdir(absoluteDirectory, { withFileTypes: true })
    ).sort((left, right) => left.name.localeCompare(right.name, 'en'))
    const seenOrders = new Set<number>()
    const seenSlugs = new Set<string>()

    for (const entry of entries) {
      if (entry.name === 'index.md' || entry.name === 'assets') continue
      const chapterPath = toRepositoryPath(directoryPath, entry.name)
      if (entry.isSymbolicLink()) {
        issues.push({
          path: chapterPath,
          reason: 'Symbolic links are not allowed in publishable content.',
        })
        continue
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue

      const match = chapterFilenamePattern.exec(entry.name)
      if (!match) {
        issues.push({
          path: chapterPath,
          reason:
            'Chapter filename must use a two-digit order and kebab-case slug.',
        })
        continue
      }
      const chapterOrder = Number(match[1])
      const chapterSlug = match[2]
      if (seenOrders.has(chapterOrder)) {
        issues.push({
          path: chapterPath,
          reason: `Chapter order ${chapterOrder} is duplicated in series "${slug}".`,
        })
        continue
      }
      if (seenSlugs.has(chapterSlug)) {
        issues.push({
          path: chapterPath,
          reason: `Chapter slug "${chapterSlug}" is duplicated in series "${slug}".`,
        })
        continue
      }
      seenOrders.add(chapterOrder)
      seenSlugs.add(chapterSlug)

      const chapterFrontmatter = await parseMarkdownFrontmatter(
        repositoryRoot,
        chapterPath,
        issues,
        { chapter: true, languageRequired: false },
      )
      if (!chapterFrontmatter) continue
      chapters.push({
        chapterOrder,
        kind: 'novelChapter',
        language: frontmatter.language,
        seriesSlug: slug,
        slug: chapterSlug,
        sourcePath: chapterPath,
        title: chapterFrontmatter.title,
      })
    }
  }

  return { chapters, series }
}

export async function scanContentRepository(
  repositoryRoot: string,
): Promise<ContentRepositoryScan> {
  const root = path.resolve(repositoryRoot)
  const issues: ContentRepositoryIssue[] = []

  const [blogs, novels] = await Promise.all([
    scanBlogs(root, issues),
    scanSeries(root, issues),
  ])

  if (issues.length > 0) throw new ContentRepositoryError(issues)

  return {
    blogs: blogs.sort((left, right) => left.slug.localeCompare(right.slug, 'en')),
    chapters: novels.chapters.sort(
      (left, right) =>
        left.seriesSlug.localeCompare(right.seriesSlug, 'en') ||
        left.chapterOrder - right.chapterOrder ||
        left.slug.localeCompare(right.slug, 'en'),
    ),
    series: novels.series.sort((left, right) =>
      left.slug.localeCompare(right.slug, 'en'),
    ),
  }
}
