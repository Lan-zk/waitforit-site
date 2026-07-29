import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { resolveContentFile } from '@/content/paths'

const contentTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await params
  const sourcePath = `content/${segments.join('/')}`
  const extension = path.posix.extname(sourcePath).toLowerCase()
  const contentType = contentTypes[extension]
  if (!contentType) return new Response('Not found', { status: 404 })

  try {
    const absolutePath = await resolveContentFile(sourcePath, {
      extensions: Object.keys(contentTypes),
    })
    const body = await readFile(absolutePath)
    return new Response(body, {
      headers: {
        'Cache-Control': 'public, max-age=60, must-revalidate',
        'Content-Security-Policy':
          "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
