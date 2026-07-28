import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function ResumePage() {
  const payload = await getPayload({ config })
  const resume = await payload.findGlobal({ slug: 'resume' })
  return (
    <main style={{ padding: '2rem', color: '#fff', background: '#000', minHeight: '100vh' }}>
      <h1>{resume?.title ?? 'Resume'}</h1>
      <p>内容待补</p>
    </main>
  )
}
