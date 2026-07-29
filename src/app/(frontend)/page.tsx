import { getPayload } from 'payload'
import React from 'react'

import { GradientOverlays } from '@/components/GradientOverlays'
import { ProjectScene } from '@/components/ProjectScene'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getNavigationLabel } from '@/i18n/dictionaries'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'
import { getManifest } from '@/utilities/getManifest'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [manifest, header, footer, settings, i18n] = await Promise.all([
    getManifest(),
    payload.findGlobal({ slug: 'header' }),
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'site-settings' }),
    getI18n(),
  ])

  const { dictionary, locale } = i18n
  const nav = (header?.nav ?? []).map((item) => ({
    href: item.href ?? '',
    label: getNavigationLabel(dictionary, item.href ?? '', item.label ?? ''),
  }))
  const brandName = settings?.name ?? 'Wait For It'
  const contactHref = settings?.email ? `mailto:${settings.email}` : '/'
  const email = footer?.email ?? settings?.email ?? ''
  const indexHref = '/projects'

  return (
    <>
      <ProjectScene
        labels={dictionary.scene}
        projects={manifest}
      />
      <GradientOverlays />
      <SiteHeader
        brandName={brandName}
        contactHref={contactHref}
        labels={{
          contact: dictionary.navigation.contact,
          home: dictionary.navigation.home,
          language: dictionary.language,
          localTime: dictionary.time.localTime,
          navigation: dictionary.navigation.ariaLabel,
        }}
        locale={locale}
        nav={nav}
      />
      <SiteFooter
        email={email}
        indexHref={indexHref}
        labels={dictionary.footer}
      />
    </>
  )
}
