import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { ContentRepositoryError } from '@/content/errors'
import { scanContentRepository } from '@/content/scanContentRepository'

const fixtureRoot = path.resolve('tests/fixtures/content-repo')

async function createRepository() {
  const root = await mkdtemp(path.join(tmpdir(), 'waitforit-content-'))
  await mkdir(path.join(root, 'content', 'blog'), { recursive: true })
  await mkdir(path.join(root, 'content', 'novels'), { recursive: true })
  return root
}

describe('scanContentRepository', () => {
  it('derives deterministic blog, series, and chapter metadata from paths', async () => {
    const result = await scanContentRepository(fixtureRoot)

    expect(result.blogs).toEqual([
      {
        coverPath: 'content/blog/test-post/assets/cover.svg',
        kind: 'blog',
        language: 'zh-CN',
        publishedAt: '2026-07-29T00:00:00.000Z',
        slug: 'test-post',
        sourcePath: 'content/blog/test-post/index.md',
        summary: '用于验证内容扫描器。',
        title: '测试文章',
      },
    ])
    expect(result.series).toEqual([
      {
        coverPath: 'content/novels/night-train/assets/cover.svg',
        language: 'zh-CN',
        publishedAt: '2026-07-28T12:00:00.000Z',
        slug: 'night-train',
        sourcePath: 'content/novels/night-train/index.md',
        summary: '一篇测试短篇。',
        title: '夜车',
      },
    ])
    expect(result.chapters).toEqual([
      {
        chapterOrder: 1,
        kind: 'novelChapter',
        language: 'zh-CN',
        seriesSlug: 'night-train',
        slug: 'arrival',
        sourcePath: 'content/novels/night-train/01-arrival.md',
        title: '抵达',
      },
      {
        chapterOrder: 2,
        kind: 'novelChapter',
        language: 'zh-CN',
        seriesSlug: 'night-train',
        slug: 'platform',
        sourcePath: 'content/novels/night-train/02-platform.md',
        title: '站台',
      },
    ])
  })

  it('reports the repository-relative filename and reason for invalid frontmatter', async () => {
    const root = await createRepository()
    const articleDirectory = path.join(root, 'content', 'blog', 'broken')
    await mkdir(articleDirectory, { recursive: true })
    await writeFile(
      path.join(articleDirectory, 'index.md'),
      '---\nlanguage: zh-CN\n---\n\nMissing title.\n',
    )

    await expect(scanContentRepository(root)).rejects.toMatchObject({
      name: 'ContentRepositoryError',
      issues: [
        {
          path: 'content/blog/broken/index.md',
          reason: 'Frontmatter field "title" is required.',
        },
      ],
    } satisfies Partial<ContentRepositoryError>)
  })

  it('rejects duplicate chapter order before returning metadata', async () => {
    const root = await createRepository()
    const novelDirectory = path.join(root, 'content', 'novels', 'duplicate')
    await mkdir(novelDirectory, { recursive: true })
    await writeFile(
      path.join(novelDirectory, 'index.md'),
      '---\ntitle: Duplicate\nlanguage: en\n---\n',
    )
    await writeFile(path.join(novelDirectory, '01-one.md'), '---\ntitle: One\n---\n')
    await writeFile(path.join(novelDirectory, '01-two.md'), '---\ntitle: Two\n---\n')

    await expect(scanContentRepository(root)).rejects.toMatchObject({
      issues: [
        {
          path: 'content/novels/duplicate/01-two.md',
          reason: 'Chapter order 1 is duplicated in series "duplicate".',
        },
      ],
    })
  })

  it('rejects symbolic links inside the publishable tree when the platform permits them', async () => {
    const root = await createRepository()
    const outside = path.join(root, 'private.md')
    const articleDirectory = path.join(root, 'content', 'blog', 'linked')
    await mkdir(articleDirectory, { recursive: true })
    await writeFile(outside, '---\ntitle: Private\nlanguage: en\n---\n')

    try {
      await symlink(outside, path.join(articleDirectory, 'index.md'), 'file')
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code === 'EPERM' || code === 'EACCES') return
      throw error
    }

    await expect(scanContentRepository(root)).rejects.toMatchObject({
      issues: [
        {
          path: 'content/blog/linked/index.md',
          reason: 'Symbolic links are not allowed in publishable content.',
        },
      ],
    })
  })
})
