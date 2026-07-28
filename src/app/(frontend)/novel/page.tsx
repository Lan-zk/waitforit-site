import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function NovelList() {
  const payload = await getPayload({ config })
  const [{ docs }, { dictionary, locale }] = await Promise.all([
    payload.find({
      collection: 'novels',
      depth: 0,
      limit: 100,
      sort: 'sortOrder',
      select: { title: true, slug: true },
    }),
    getI18n(),
  ])

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      languageLabels={dictionary.language}
      locale={locale}
      title={dictionary.pages.novel}
    >
      {docs.length === 0 ? (
        <p>{dictionary.pages.empty}</p>
      ) : (
        <ul>
          {docs.map((doc) => (
            <li key={doc.id}>
              <a href={`/novel/${doc.slug}`}>{doc.title}</a>
            </li>
          ))}
        </ul>
      )}
    </ContentPage>
  )
}
