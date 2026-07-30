import React from 'react'

import { GradientOverlays } from '@/components/GradientOverlays'
import { ProjectScene } from '@/components/ProjectScene'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { getNavigationLabel } from '@/i18n/dictionaries'
import { getI18n } from '@/i18n/server'
import { getManifest } from '@/utilities/getManifest'
import { getSiteChrome } from '@/utilities/getSiteChrome'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [manifest, site, i18n] = await Promise.all([
    getManifest(),
    getSiteChrome(),
    getI18n(),
  ])

  const { dictionary, locale } = i18n
  const nav = site.headerNav.map((item) => ({
    href: item.href,
    label: getNavigationLabel(dictionary, item.href, item.label),
  }))
  const indexHref = '/projects'

  return (
    <>
      <ProjectScene
        labels={dictionary.scene}
        projects={manifest}
      />
      <GradientOverlays />
      <SiteHeader
        brandName={site.brandName}
        emailHref={site.email ? `mailto:${site.email}` : undefined}
        githubHref={site.githubURL}
        labels={{
          email: dictionary.navigation.email,
          github: dictionary.navigation.github,
          home: dictionary.navigation.home,
          language: dictionary.language,
          navigation: dictionary.navigation.ariaLabel,
        }}
        locale={locale}
        nav={nav}
        variant="scene"
      />
      <SiteFooter
        email={site.email}
        indexHref={indexHref}
        labels={dictionary.footer}
        variant="scene"
      />
    </>
  )
}
