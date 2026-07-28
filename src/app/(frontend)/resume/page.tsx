import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function ResumePage() {
  const payload = await getPayload({ config })
  const [resume, { dictionary, locale }] = await Promise.all([
    payload.findGlobal({ slug: 'resume' }),
    getI18n(),
  ])

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      languageLabels={dictionary.language}
      locale={locale}
      title={resume?.title ?? dictionary.pages.resume}
    >
      <p>{dictionary.pages.shell}</p>
    </ContentPage>
  )
}
