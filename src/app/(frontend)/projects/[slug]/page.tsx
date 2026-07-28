import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import { getI18n } from '@/i18n/server'
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
  const { dictionary, locale } = await getI18n()

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      languageLabels={dictionary.language}
      locale={locale}
      title={doc.title}
    >
      <p>{dictionary.pages.shell}</p>
    </ContentPage>
  )
}
