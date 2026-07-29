import type { Payload, PayloadRequest } from 'payload'
import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
} from 'payload'

import type { Series, Writing } from '@/payload-types'

import { scanContentRepository } from './scanContentRepository'
import type {
  BlogMetadata,
  ChapterMetadata,
  SeriesMetadata,
} from './types'

export interface ContentSyncReport {
  createdSeries: number
  createdWritings: number
  deletedSeries: number
  deletedWritings: number
  updatedSeries: number
  updatedWritings: number
}

interface SyncOptions {
  now?: Date
  repositoryRoot: string
}

function normalizeOptional(value: null | string | undefined) {
  return value ?? null
}

function normalizeRelationship(
  value: null | number | Series | undefined,
) {
  if (value && typeof value === 'object') return value.id
  return value ?? null
}

function seriesHasChanged(document: Series, metadata: SeriesMetadata) {
  return (
    document.title !== metadata.title ||
    document.slug !== metadata.slug ||
    document.language !== metadata.language ||
    normalizeOptional(document.summary) !==
      normalizeOptional(metadata.summary) ||
    document.sourcePath !== metadata.sourcePath ||
    normalizeOptional(document.coverPath) !==
      normalizeOptional(metadata.coverPath) ||
    normalizeOptional(document.publishedAt) !==
      normalizeOptional(metadata.publishedAt)
  )
}

function writingHasChanged(
  document: Writing,
  metadata: BlogMetadata | ChapterMetadata,
  seriesID: null | number,
) {
  const isChapter = metadata.kind === 'novelChapter'
  return (
    document.title !== metadata.title ||
    document.slug !== metadata.slug ||
    document.kind !== metadata.kind ||
    document.language !== metadata.language ||
    normalizeOptional(document.summary) !==
      normalizeOptional(isChapter ? undefined : metadata.summary) ||
    document.sourcePath !== metadata.sourcePath ||
    normalizeRelationship(document.series) !== seriesID ||
    (document.chapterOrder ?? null) !==
      (isChapter ? metadata.chapterOrder : null) ||
    normalizeOptional(document.coverPath) !==
      normalizeOptional(isChapter ? undefined : metadata.coverPath) ||
    normalizeOptional(document.publishedAt) !==
      normalizeOptional(isChapter ? undefined : metadata.publishedAt)
  )
}

async function synchronizeValidatedContent(
  payload: Payload,
  req: PayloadRequest,
  options: SyncOptions,
): Promise<ContentSyncReport> {
  const scan = await scanContentRepository(options.repositoryRoot)
  const syncedAt = (options.now ?? new Date()).toISOString()
  const report: ContentSyncReport = {
    createdSeries: 0,
    createdWritings: 0,
    deletedSeries: 0,
    deletedWritings: 0,
    updatedSeries: 0,
    updatedWritings: 0,
  }

  const [existingSeriesResult, existingWritingsResult] = await Promise.all([
    payload.find({
      collection: 'series',
      depth: 0,
      limit: 10_000,
      overrideAccess: true,
      req,
    }),
    payload.find({
      collection: 'writings',
      depth: 0,
      limit: 10_000,
      overrideAccess: true,
      req,
    }),
  ])
  const existingSeriesByPath = new Map(
    existingSeriesResult.docs.map((document) => [document.sourcePath, document]),
  )
  const existingWritingsByPath = new Map(
    existingWritingsResult.docs.map((document) => [
      document.sourcePath,
      document,
    ]),
  )
  const currentSeriesPaths = new Set(scan.series.map((item) => item.sourcePath))
  const currentWritingPaths = new Set([
    ...scan.blogs.map((item) => item.sourcePath),
    ...scan.chapters.map((item) => item.sourcePath),
  ])
  const seriesIDsBySlug = new Map<string, number>()

  for (const metadata of scan.series) {
    const data = {
      coverPath: metadata.coverPath ?? null,
      language: metadata.language,
      publishedAt: metadata.publishedAt ?? null,
      slug: metadata.slug,
      sourcePath: metadata.sourcePath,
      summary: metadata.summary ?? null,
      syncedAt,
      title: metadata.title,
    }
    const existing = existingSeriesByPath.get(metadata.sourcePath)
    if (!existing) {
      const created = await payload.create({
        collection: 'series',
        data,
        disableTransaction: true,
        overrideAccess: true,
        req,
      })
      seriesIDsBySlug.set(metadata.slug, created.id)
      report.createdSeries += 1
    } else if (seriesHasChanged(existing, metadata)) {
      const updated = await payload.update({
        collection: 'series',
        id: existing.id,
        data,
        disableTransaction: true,
        overrideAccess: true,
        req,
      })
      seriesIDsBySlug.set(metadata.slug, updated.id)
      report.updatedSeries += 1
    } else {
      seriesIDsBySlug.set(metadata.slug, existing.id)
    }
  }

  const writings: Array<BlogMetadata | ChapterMetadata> = [
    ...scan.blogs,
    ...scan.chapters,
  ]
  for (const metadata of writings) {
    const isChapter = metadata.kind === 'novelChapter'
    const seriesID = isChapter
      ? (seriesIDsBySlug.get(metadata.seriesSlug) ?? null)
      : null
    if (isChapter && seriesID === null) {
      throw new Error(`Series "${metadata.seriesSlug}" was not synchronized.`)
    }
    const data = {
      chapterOrder: isChapter ? metadata.chapterOrder : null,
      coverPath: isChapter ? null : (metadata.coverPath ?? null),
      kind: metadata.kind,
      language: metadata.language,
      publishedAt: isChapter ? null : (metadata.publishedAt ?? null),
      series: seriesID,
      slug: metadata.slug,
      sourcePath: metadata.sourcePath,
      summary: isChapter ? null : (metadata.summary ?? null),
      syncedAt,
      title: metadata.title,
    }
    const existing = existingWritingsByPath.get(metadata.sourcePath)
    if (!existing) {
      await payload.create({
        collection: 'writings',
        data,
        disableTransaction: true,
        overrideAccess: true,
        req,
      })
      report.createdWritings += 1
    } else if (writingHasChanged(existing, metadata, seriesID)) {
      await payload.update({
        collection: 'writings',
        id: existing.id,
        data,
        disableTransaction: true,
        overrideAccess: true,
        req,
      })
      report.updatedWritings += 1
    }
  }

  for (const document of existingWritingsResult.docs) {
    if (!currentWritingPaths.has(document.sourcePath)) {
      await payload.delete({
        collection: 'writings',
        id: document.id,
        disableTransaction: true,
        overrideAccess: true,
        req,
      })
      report.deletedWritings += 1
    }
  }
  for (const document of existingSeriesResult.docs) {
    if (!currentSeriesPaths.has(document.sourcePath)) {
      await payload.delete({
        collection: 'series',
        id: document.id,
        disableTransaction: true,
        overrideAccess: true,
        req,
      })
      report.deletedSeries += 1
    }
  }

  return report
}

export async function syncContentRepository(
  payload: Payload,
  options: SyncOptions,
) {
  // Parsing precedes transaction creation, so malformed repositories cannot
  // produce a partially updated metadata index.
  await scanContentRepository(options.repositoryRoot)

  const req = await createLocalReq({}, payload)
  const startedTransaction = await initTransaction(req)
  try {
    const report = await synchronizeValidatedContent(payload, req, options)
    if (startedTransaction) await commitTransaction(req)
    return report
  } catch (error) {
    if (startedTransaction) await killTransaction(req)
    throw error
  }
}
