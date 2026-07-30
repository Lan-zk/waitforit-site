import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import { PublishingList } from '@/components/PublishingList'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function NovelList() {
  const payload = await getPayload({ config })
  const [{ docs }, { dictionary, locale }] = await Promise.all([
    payload.find({
      collection: 'series',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      sort: '-publishedAt',
      select: {
        publishedAt: true,
        slug: true,
        summary: true,
        title: true,
      },
    }),
    getI18n(),
  ])

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      title={dictionary.pages.novel}
      description={dictionary.pages.novelIntro}
    >
      {docs.length === 0 ? (
        <p>{dictionary.pages.empty}</p>
      ) : (
        <PublishingList
          items={docs.map((doc) => ({
            href: `/novel/${doc.slug}`,
            meta: doc.publishedAt
              ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                  new Date(doc.publishedAt),
                )
              : undefined,
            summary: doc.summary,
            title: doc.title,
          }))}
          variant="spotlight"
        />
      )}
    </ContentPage>
  )
}
