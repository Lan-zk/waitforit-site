import type { Payload } from 'payload'
import { getPayload } from 'payload'

import config from '@/payload.config'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let createdSeriesId: number
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const seriesSlug = `model-series-${suffix}`
const chapterSlug = `model-chapter-${suffix}`

describe('writings and series model', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  afterAll(async () => {
    const writings = await payload.find({
      collection: 'writings',
      depth: 0,
      limit: 100,
      where: { slug: { contains: suffix } },
    })
    for (const writing of writings.docs) {
      await payload.delete({ collection: 'writings', id: writing.id })
    }
    const series = await payload.find({
      collection: 'series',
      depth: 0,
      limit: 100,
      where: { slug: { contains: suffix } },
    })
    for (const item of series.docs) {
      await payload.delete({ collection: 'series', id: item.id })
    }
  })

  it('denies ordinary API writes while trusted Local API writes remain available', async () => {
    const now = new Date().toISOString()

    await expect(
      payload.create({
        collection: 'series',
        data: {
          language: 'en',
          slug: `${seriesSlug}-denied`,
          sourcePath: `content/novels/${seriesSlug}-denied/index.md`,
          syncedAt: now,
          title: 'Denied series',
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    const createdSeries = await payload.create({
      collection: 'series',
      data: {
        language: 'en',
        slug: seriesSlug,
        sourcePath: `content/novels/${seriesSlug}/index.md`,
        syncedAt: now,
        title: 'Model series',
      },
    })
    createdSeriesId = createdSeries.id
    const chapter = await payload.create({
      collection: 'writings',
      data: {
        chapterOrder: 1,
        kind: 'novelChapter',
        language: 'en',
        series: createdSeries.id,
        slug: chapterSlug,
        sourcePath: `content/novels/${seriesSlug}/01-${chapterSlug}.md`,
        syncedAt: now,
        title: 'Model chapter',
      },
    })

    const anonymousRead = await payload.find({
      collection: 'writings',
      depth: 0,
      overrideAccess: false,
      where: { slug: { equals: chapterSlug } },
    })
    expect(anonymousRead.docs).toHaveLength(1)
    expect(anonymousRead.docs[0]).toMatchObject({
      chapterOrder: 1,
      kind: 'novelChapter',
      series: createdSeries.id,
    })

    await expect(
      payload.update({
        collection: 'writings',
        id: chapter.id,
        data: { title: 'Forbidden update' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    await expect(
      payload.delete({
        collection: 'writings',
        id: chapter.id,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('requires series and integer order for novel chapters', async () => {
    await expect(
      payload.create({
        collection: 'writings',
        data: {
          kind: 'novelChapter',
          chapterOrder: 1,
          language: 'en',
          slug: `${chapterSlug}-invalid`,
          sourcePath: `content/novels/${seriesSlug}/invalid.md`,
          syncedAt: new Date().toISOString(),
          title: 'Invalid chapter',
        },
      }),
    ).rejects.toThrow()

    await expect(
      payload.create({
        collection: 'writings',
        data: {
          chapterOrder: 1.5,
          kind: 'novelChapter',
          language: 'en',
          series: createdSeriesId,
          slug: `${chapterSlug}-invalid-order`,
          sourcePath: `content/novels/${seriesSlug}/invalid-order.md`,
          syncedAt: new Date().toISOString(),
          title: 'Invalid order',
        },
      }),
    ).rejects.toThrow()
  })
})
