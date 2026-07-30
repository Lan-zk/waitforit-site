import 'dotenv/config'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../payload.config'

interface SeedItem {
  collection: 'projects' | 'photography'
  title: string
  slug: string
  image: string
  sortOrder: number
  summary: string
}

const IMAGES_DIR = path.resolve(
  process.cwd(),
  'docs/gabrielveres/public/assets/projects',
)

const SEED_ITEMS: SeedItem[] = [
  {
    collection: 'projects',
    title: 'XYLO',
    slug: 'xylo',
    image: '09-xylo-42d3ecaa.webp',
    sortOrder: 0,
    summary: 'A spatial brand system.',
  },
  {
    collection: 'photography',
    title: 'Divino',
    slug: 'divino',
    image: '02-divino-harrogate-d1c805f1.webp',
    sortOrder: 1,
    summary: 'A street frame.',
  },
]

async function uploadMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
  alt: string,
) {
  const filePath = path.join(IMAGES_DIR, filename)
  const data = await readFile(filePath)
  return payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: 'image/webp',
      name: filename,
      size: data.length,
    },
  })
}

async function seed() {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'projects',
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    console.log('already seeded, skipping')
    await payload.destroy()
    return
  }

  for (const item of SEED_ITEMS) {
    const media = await uploadMedia(payload, item.image, item.title)
    await payload.create({
      collection: item.collection,
      data: {
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        cover: media.id,
        sortOrder: item.sortOrder,
      },
    })
    console.log(`created ${item.collection}/${item.slug}`)
  }

  const resumeMedia = await uploadMedia(payload, '06-bark-eebeb28d.webp', 'Resume')
  await payload.updateGlobal({
    slug: 'resume',
    data: { title: 'Resume', cover: resumeMedia.id, sortOrder: 4 },
  })
  console.log('set resume global')

  await payload.updateGlobal({
    slug: 'header',
    data: {
      nav: [
        { label: 'Work', href: '/projects' },
        { label: 'Blog', href: '/blog' },
        { label: 'Novel', href: '/novel' },
        { label: 'Resume', href: '/resume' },
      ],
    },
  })
  console.log('set header global')

  await payload.updateGlobal({
    slug: 'footer',
    data: { email: 'hello@example.com', copyright: 'Wait For It' },
  })
  console.log('set footer global')

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      name: 'Wait For It',
      description: 'Personal site',
      url: 'http://localhost:3000',
      email: 'hello@example.com',
      social: [{ label: 'GitHub', url: 'https://github.com/Lan-zk' }],
    },
  })
  console.log('set site-settings global')

  await payload.destroy()
  console.log('seed done')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
