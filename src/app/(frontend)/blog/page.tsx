import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function BlogList() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 100,
    sort: 'sortOrder',
    select: { title: true, slug: true },
  })
  return (
    <main style={{ padding: '2rem', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <h1>Blog</h1>
      <ul>
        {docs.map((doc) => (
          <li key={doc.id}>
            <a href={`/blog/${doc.slug}`} style={{ color: '#ddfa42' }}>
              {doc.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
