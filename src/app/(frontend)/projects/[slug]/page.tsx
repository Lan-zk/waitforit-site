import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  const doc = docs[0]
  if (!doc) notFound()
  return (
    <main style={{ padding: '2rem', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <h1>{doc.title}</h1>
      <p>内容待补</p>
    </main>
  )
}
