import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import {
  hasMeaningfulRichText,
  RichTextRenderer,
} from '@/components/RichTextRenderer'
import { PublishingList } from '@/components/PublishingList'
import {
  hasStructuredResume,
  ResumeView,
} from '@/components/ResumeView'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'
import { getSiteChrome } from '@/utilities/getSiteChrome'

export const dynamic = 'force-dynamic'

export default async function ResumePage() {
  const payload = await getPayload({ config })
  const [resume, site, { dictionary }] = await Promise.all([
    payload.findGlobal({
      slug: 'resume',
      depth: 1,
      overrideAccess: false,
      select: {
        coreCapabilities: true,
        content: true,
        currentFocus: true,
        governanceCases: true,
        positioning: true,
        professionalProjects: true,
        publicProducts: true,
        skillGroups: true,
        title: true,
      },
    }),
    getSiteChrome(),
    getI18n(),
  ])
  const hasContent = hasMeaningfulRichText(resume?.content)
  const hasStructuredContent = hasStructuredResume(resume)

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      title="简历"
      variant="resume"
    >
      {hasStructuredContent ? (
        <ResumeView
          email={site.email || undefined}
          resume={resume}
          supplement={
            hasContent ? <RichTextRenderer data={resume.content} /> : undefined
          }
        />
      ) : hasContent ? (
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
