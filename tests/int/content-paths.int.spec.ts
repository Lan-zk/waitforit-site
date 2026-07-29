import { mkdtemp, mkdir, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  resolveContentFile,
  resolveMarkdownAssetSource,
  toContentAssetUrl,
} from '@/content/paths'
import { getContentImageMetadata } from '@/content/readContentImage'
import { readMarkdownFile } from '@/content/readMarkdown'

const fixtureRoot = path.resolve('tests/fixtures/content-repo')

describe('content path handling', () => {
  it('resolves an existing repository-relative content file', async () => {
    const resolved = await resolveContentFile(
      'content/blog/test-post/index.md',
      { repositoryRoot: fixtureRoot, extensions: ['.md'] },
    )

    expect(resolved).toBe(
      path.join(fixtureRoot, 'content', 'blog', 'test-post', 'index.md'),
    )
  })

  it.each([
    '../README.md',
    'README.md',
    '/content/blog/test-post/index.md',
    'content\\blog\\test-post\\index.md',
    'content/blog/test-post/../../../../README.md',
  ])('rejects unsafe source path %s', async (sourcePath) => {
    await expect(
      resolveContentFile(sourcePath, {
        repositoryRoot: fixtureRoot,
        extensions: ['.md'],
      }),
    ).rejects.toMatchObject({ code: 'UNSAFE_PATH' })
  })

  it('rejects a final path that escapes through a symbolic link', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'waitforit-paths-'))
    const contentRoot = path.join(root, 'content')
    const outside = path.join(root, 'outside.md')
    await mkdir(contentRoot, { recursive: true })
    await writeFile(outside, 'private')

    try {
      await symlink(outside, path.join(contentRoot, 'linked.md'), 'file')
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code === 'EPERM' || code === 'EACCES') return
      throw error
    }

    await expect(
      resolveContentFile('content/linked.md', {
        repositoryRoot: root,
        extensions: ['.md'],
      }),
    ).rejects.toMatchObject({ code: 'UNSAFE_PATH' })
  })

  it('strips Frontmatter when reading Markdown content', async () => {
    const markdown = await readMarkdownFile(
      'content/blog/test-post/index.md',
      fixtureRoot,
    )

    expect(markdown).toContain('# 测试文章')
    expect(markdown).not.toContain('publishedAt:')
  })

  it('reads dimensions for a repository image without exposing its filesystem path', async () => {
    const metadata = await getContentImageMetadata(
      'content/blog/test-post/assets/cover.svg',
      fixtureRoot,
    )

    expect(metadata).toEqual({
      height: 630,
      url: '/content-assets/blog/test-post/assets/cover.svg',
      width: 1200,
    })
  })

  it('rewrites local Markdown assets to the controlled public route', () => {
    expect(
      resolveMarkdownAssetSource(
        'content/blog/test-post/index.md',
        './assets/cover.svg',
      ),
    ).toBe('/content-assets/blog/test-post/assets/cover.svg')
    expect(toContentAssetUrl('content/novels/night-train/assets/cover.svg')).toBe(
      '/content-assets/novels/night-train/assets/cover.svg',
    )
  })

  it('does not rewrite remote, fragment, or unsafe Markdown URLs', () => {
    expect(
      resolveMarkdownAssetSource(
        'content/blog/test-post/index.md',
        'https://example.com/image.png',
      ),
    ).toBe('https://example.com/image.png')
    expect(
      resolveMarkdownAssetSource(
        'content/blog/test-post/index.md',
        '#section',
      ),
    ).toBe('#section')
    expect(
      resolveMarkdownAssetSource(
        'content/blog/test-post/index.md',
        '../../../../private.png',
      ),
    ).toBeUndefined()
  })
})
