import { lstat, realpath } from 'node:fs/promises'
import path from 'node:path'

export type ContentFileErrorCode =
  | 'INVALID_EXTENSION'
  | 'MISSING_CONTENT_ROOT'
  | 'MISSING_FILE'
  | 'UNSAFE_PATH'

export class ContentFileError extends Error {
  code: ContentFileErrorCode

  constructor(code: ContentFileErrorCode, message: string) {
    super(message)
    this.name = 'ContentFileError'
    this.code = code
  }
}

export function getContentRepositoryRoot() {
  const configuredRoot = process.env.CONTENT_REPO_ROOT
  if (!configuredRoot) {
    throw new ContentFileError(
      'MISSING_CONTENT_ROOT',
      'CONTENT_REPO_ROOT is not configured.',
    )
  }
  return path.resolve(configuredRoot)
}

function normalizeRepositoryPath(sourcePath: string) {
  if (
    !sourcePath ||
    sourcePath.includes('\\') ||
    path.posix.isAbsolute(sourcePath) ||
    /^[A-Za-z]:/.test(sourcePath)
  ) {
    throw new ContentFileError('UNSAFE_PATH', 'Content path is unsafe.')
  }

  const normalized = path.posix.normalize(sourcePath)
  if (
    normalized === 'content' ||
    !normalized.startsWith('content/') ||
    normalized.split('/').includes('..')
  ) {
    throw new ContentFileError('UNSAFE_PATH', 'Content path is unsafe.')
  }
  return normalized
}

function isWithin(parent: string, candidate: string) {
  const relative = path.relative(parent, candidate)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export async function resolveContentFile(
  sourcePath: string,
  options: {
    extensions?: string[]
    repositoryRoot?: string
  } = {},
) {
  const normalized = normalizeRepositoryPath(sourcePath)
  const extension = path.posix.extname(normalized).toLowerCase()
  if (
    options.extensions &&
    !options.extensions.map((value) => value.toLowerCase()).includes(extension)
  ) {
    throw new ContentFileError(
      'INVALID_EXTENSION',
      'Content file extension is not allowed.',
    )
  }

  const repositoryRoot = path.resolve(
    options.repositoryRoot ?? getContentRepositoryRoot(),
  )
  const contentRoot = path.join(repositoryRoot, 'content')
  const candidate = path.join(repositoryRoot, ...normalized.split('/'))
  if (!isWithin(contentRoot, candidate)) {
    throw new ContentFileError('UNSAFE_PATH', 'Content path is unsafe.')
  }

  let canonicalContentRoot: string
  let canonicalCandidate: string
  try {
    ;[canonicalContentRoot, canonicalCandidate] = await Promise.all([
      realpath(contentRoot),
      realpath(candidate),
    ])
  } catch {
    throw new ContentFileError('MISSING_FILE', 'Content file does not exist.')
  }

  if (!isWithin(canonicalContentRoot, canonicalCandidate)) {
    throw new ContentFileError('UNSAFE_PATH', 'Content path is unsafe.')
  }

  const stats = await lstat(candidate)
  if (stats.isSymbolicLink()) {
    throw new ContentFileError(
      'UNSAFE_PATH',
      'Symbolic links are not allowed.',
    )
  }
  if (!stats.isFile()) {
    throw new ContentFileError('MISSING_FILE', 'Content file does not exist.')
  }

  return candidate
}

export function toContentAssetUrl(sourcePath: string) {
  const normalized = normalizeRepositoryPath(sourcePath)
  const relative = normalized.slice('content/'.length)
  return `/content-assets/${relative
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`
}

export function resolveMarkdownAssetSource(
  markdownSourcePath: string,
  source: string,
) {
  if (
    source.startsWith('https://') ||
    source.startsWith('http://') ||
    source.startsWith('#')
  ) {
    return source
  }
  if (
    source.startsWith('//') ||
    /^[A-Za-z][A-Za-z0-9+.-]*:/.test(source) ||
    source.includes('\\')
  ) {
    return undefined
  }

  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(markdownSourcePath), source),
  )
  try {
    return toContentAssetUrl(resolved)
  } catch {
    return undefined
  }
}
