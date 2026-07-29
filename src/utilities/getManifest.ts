import config from '@payload-config'
import { getPayload } from 'payload'

import type { ProjectTexture } from '@/types/project'
import { getContentImageMetadata } from '@/content/readContentImage'

type ContentSlug = 'projects' | 'photography'

const ROUTE_PREFIX: Record<ContentSlug, string> = {
  projects: '/projects',
  photography: '/photography',
}

interface CoverMedia {
  url?: string | null
  width?: number | null
  height?: number | null
}

interface RawEntry {
  id: string
  title: string
  route: string
  sortOrder: number
  cover: CoverMedia | null
}

interface CollectionDoc {
  id: number | string
  title: string
  slug: string
  sortOrder?: number | null
  cover?: CoverMedia | null
}

interface PublishingDoc {
  coverPath?: string | null
  id: number | string
  publishedAt?: string | null
  slug: string
  title: string
}

function toTexture(entry: RawEntry, index: number): ProjectTexture | null {
  const cover = entry.cover
  if (!cover?.url || !cover?.width || !cover?.height) {
    return null
  }
  const width = cover.width
  const height = cover.height
  return {
    id: entry.id,
    index,
    title: entry.title,
    slug: entry.route,
    sourceRef: '',
    sourceUrl: '',
    localPath: cover.url,
    width,
    height,
    aspectRatio: width / height,
  }
}

export async function getManifest(): Promise<ProjectTexture[]> {
  const payload = await getPayload({ config })

  const [projects, blogs, series, photography, resume] = await Promise.all([
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 100,
      sort: 'sortOrder',
      select: { title: true, slug: true, cover: true, sortOrder: true },
    }),
    payload.find({
      collection: 'writings',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: '-publishedAt',
      where: {
        and: [
          { coverPath: { exists: true } },
          { kind: { equals: 'blog' } },
        ],
      },
      select: {
        coverPath: true,
        publishedAt: true,
        slug: true,
        title: true,
      },
    }),
    payload.find({
      collection: 'series',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: '-publishedAt',
      where: { coverPath: { exists: true } },
      select: {
        coverPath: true,
        publishedAt: true,
        slug: true,
        title: true,
      },
    }),
    payload.find({
      collection: 'photography',
      depth: 1,
      limit: 100,
      sort: 'sortOrder',
      select: { title: true, slug: true, cover: true, sortOrder: true },
    }),
    payload.findGlobal({
      slug: 'resume',
      depth: 1,
      select: { title: true, cover: true, sortOrder: true },
    }),
  ])

  const raw: RawEntry[] = []

  const pushDocs = (slug: ContentSlug, docs: CollectionDoc[]) => {
    for (const doc of docs) {
      raw.push({
        id: `${slug}-${doc.id}`,
        title: doc.title,
        route: `${ROUTE_PREFIX[slug]}/${doc.slug}`,
        sortOrder: doc.sortOrder ?? 0,
        cover: doc.cover ?? null,
      })
    }
  }

  pushDocs('projects', projects.docs as CollectionDoc[])
  pushDocs('photography', photography.docs as CollectionDoc[])

  const pushPublishingDocs = async (
    prefix: '/blog' | '/novel',
    docs: PublishingDoc[],
    offset: number,
  ) => {
    for (const [index, doc] of docs.entries()) {
      if (!doc.coverPath) continue
      try {
        const cover = await getContentImageMetadata(doc.coverPath)
        raw.push({
          cover,
          id: `${prefix}-${doc.id}`,
          route: `${prefix}/${doc.slug}`,
          sortOrder: offset + index,
          title: doc.title,
        })
      } catch {
        // A missing cover must not break the homepage scene. The corresponding
        // publishing page remains available and exposes the controlled 404.
      }
    }
  }

  await Promise.all([
    pushPublishingDocs('/blog', blogs.docs as PublishingDoc[], 1000),
    pushPublishingDocs('/novel', series.docs as PublishingDoc[], 2000),
  ])

  if (resume) {
    const r = resume as {
      title?: string | null
      sortOrder?: number | null
      cover?: CoverMedia | null
    }
    raw.push({
      id: 'resume',
      title: r.title ?? 'Resume',
      route: '/resume',
      sortOrder: r.sortOrder ?? 0,
      cover: r.cover ?? null,
    })
  }

  raw.sort((a, b) => a.sortOrder - b.sortOrder)

  const items: ProjectTexture[] = []
  for (let i = 0; i < raw.length; i++) {
    const texture = toTexture(raw[i], i)
    if (texture) {
      items.push(texture)
    }
  }
  return items
}
