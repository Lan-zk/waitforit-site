import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import {
  hasMeaningfulRichText,
  RichTextRenderer,
} from '@/components/RichTextRenderer'
import { PublishingList } from '@/components/PublishingList'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function ResumePage() {
  const payload = await getPayload({ config })
  const [resume, { dictionary, locale }] = await Promise.all([
    payload.findGlobal({
      slug: 'resume',
      depth: 1,
      overrideAccess: false,
      select: {
        content: true,
        title: true,
      },
    }),
    getI18n(),
  ])
  const hasContent = hasMeaningfulRichText(resume?.content)

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      languageLabels={dictionary.language}
      locale={locale}
      title={resume?.title ?? dictionary.pages.resume}
    >
      {hasContent ? (
        <article>
          <RichTextRenderer data={resume.content} />
        </article>
      ) : (
        <>
          <p>{dictionary.pages.resumeEmpty}</p>
          <PublishingList
            items={[
              {
                href: '/projects',
                title: dictionary.pages.projects,
              },
              {
                href: '/blog',
                title: dictionary.pages.blog,
              },
            ]}
          />
        </>
      )}
    </ContentPage>
  )
}
