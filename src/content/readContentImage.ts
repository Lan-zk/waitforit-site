import sharp from 'sharp'

import { resolveContentFile, toContentAssetUrl } from './paths'

const imageExtensions = [
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
]

export async function getContentImageMetadata(
  sourcePath: string,
  repositoryRoot?: string,
) {
  const absolutePath = await resolveContentFile(sourcePath, {
    extensions: imageExtensions,
    repositoryRoot,
  })
  const metadata = await sharp(absolutePath).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error('Content image dimensions could not be determined.')
  }
  return {
    height: metadata.height,
    url: toContentAssetUrl(sourcePath),
    width: metadata.width,
  }
}
