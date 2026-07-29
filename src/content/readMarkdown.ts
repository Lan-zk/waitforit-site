import { readFile } from 'node:fs/promises'

import matter from 'gray-matter'

import { resolveContentFile } from './paths'

export async function readMarkdownFile(
  sourcePath: string,
  repositoryRoot?: string,
) {
  const absolutePath = await resolveContentFile(sourcePath, {
    extensions: ['.md'],
    repositoryRoot,
  })
  const source = await readFile(absolutePath, 'utf8')
  return matter(source).content
}
