import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function NovelList() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'novels',
    depth: 0,
    limit: 100,
    sort: 'sortOrder',
    select: { title: true, slug: true },
  })
  return (
    <main style={{ padding: '2rem', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <h1>Novels</h1>
      <ul>
        {docs.map((doc) => (
          <li key={doc.id}>
            <a href={`/novel/${doc.slug}`} style={{ color: '#ddfa42' }}>
              {doc.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
