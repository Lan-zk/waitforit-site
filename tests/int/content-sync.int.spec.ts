import { cp, mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import type { Payload } from 'payload'
import { getPayload } from 'payload'

import { syncContentRepository } from '@/content/syncContent'
import config from '@/payload.config'

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

let payload: Payload
const fixtureRoot = path.resolve('tests/fixtures/content-repo')

async function createFixtureCopy() {
  const root = await mkdtemp(path.join(tmpdir(), 'waitforit-sync-'))
  await cp(fixtureRoot, root, { recursive: true })
  return root
}

async function clearSyncedContent() {
  const writings = await payload.find({
    collection: 'writings',
    depth: 0,
    limit: 1000,
  })
  for (const writing of writings.docs) {
    await payload.delete({ collection: 'writings', id: writing.id })
  }
  const series = await payload.find({
    collection: 'series',
    depth: 0,
    limit: 1000,
  })
  for (const item of series.docs) {
    await payload.delete({ collection: 'series', id: item.id })
  }
}

describe('syncContentRepository', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  beforeEach(clearSyncedContent)
  afterAll(clearSyncedContent)

  it('creates indexed metadata and relationships without storing Markdown bodies', async () => {
    const report = await syncContentRepository(payload, {
      now: new Date('2026-07-29T04:00:00.000Z'),
      repositoryRoot: fixtureRoot,
    })

    expect(report).toEqual({
      createdSeries: 1,
      createdWritings: 3,
      deletedSeries: 0,
      deletedWritings: 0,
      updatedSeries: 0,
      updatedWritings: 0,
    })

    const writings = await payload.find({
      collection: 'writings',
      depth: 0,
      limit: 100,
      sort: 'chapterOrder',
    })
    expect(writings.docs).toHaveLength(3)
    expect(writings.docs.map((writing) => writing.kind)).toEqual([
      'blog',
      'novelChapter',
      'novelChapter',
    ])
    expect(writings.docs[0]).not.toHaveProperty('content')
    expect(writings.docs[1]).toMatchObject({
      chapterOrder: 1,
      language: 'zh-CN',
      slug: 'arrival',
    })
    expect(writings.docs[1].series).toEqual(
      expect.anything(),
    )
  })

  it('updates changed metadata and deletes records removed from Git', async () => {
    const root = await createFixtureCopy()
    await syncContentRepository(payload, {
      now: new Date('2026-07-29T04:00:00.000Z'),
      repositoryRoot: root,
    })

    const blogPath = path.join(
      root,
      'content',
      'blog',
      'test-post',
      'index.md',
    )
    const original = await readFile(blogPath, 'utf8')
    await writeFile(blogPath, original.replace('title: 测试文章', 'title: 已更新文章'))
    await unlink(
      path.join(
        root,
        'content',
        'novels',
        'night-train',
        '02-platform.md',
      ),
    )

    const report = await syncContentRepository(payload, {
      now: new Date('2026-07-29T04:01:00.000Z'),
      repositoryRoot: root,
    })

    expect(report).toMatchObject({
      createdSeries: 0,
      createdWritings: 0,
      deletedSeries: 0,
      deletedWritings: 1,
      updatedSeries: 0,
      updatedWritings: 1,
    })
    const blog = await payload.find({
      collection: 'writings',
      depth: 0,
      where: { slug: { equals: 'test-post' } },
    })
    expect(blog.docs[0]?.title).toBe('已更新文章')
    await rm(root, { force: true, recursive: true })
  })

  it('validates the complete repository before writing any metadata', async () => {
    await syncContentRepository(payload, {
      now: new Date('2026-07-29T04:00:00.000Z'),
      repositoryRoot: fixtureRoot,
    })
    const root = await createFixtureCopy()
    await writeFile(
      path.join(root, 'content', 'blog', 'test-post', 'index.md'),
      '---\nlanguage: zh-CN\n---\n',
    )

    await expect(
      syncContentRepository(payload, {
        now: new Date('2026-07-29T04:01:00.000Z'),
        repositoryRoot: root,
      }),
    ).rejects.toThrow('Frontmatter field "title" is required.')

    const writings = await payload.find({
      collection: 'writings',
      depth: 0,
      limit: 100,
    })
    expect(writings.docs).toHaveLength(3)
    expect(
      writings.docs.find((writing) => writing.slug === 'test-post')?.title,
    ).toBe('测试文章')
    await rm(root, { force: true, recursive: true })
  })
})
