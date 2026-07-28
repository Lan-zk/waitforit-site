import { getPayload } from 'payload'
import React from 'react'

import { GradientOverlays } from '@/components/GradientOverlays'
import { ProjectScene } from '@/components/ProjectScene'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import config from '@/payload.config'
import { getManifest } from '@/utilities/getManifest'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })

  const [manifest, header, footer, settings] = await Promise.all([
    getManifest(),
    payload.findGlobal({ slug: 'header' }),
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ])

  const nav = (header?.nav ?? []).map((item) => ({
    label: item.label ?? '',
    href: item.href ?? '',
  }))
  const brandName = settings?.name ?? 'Wait For It'
  const contactHref = settings?.email ? `mailto:${settings.email}` : '/'
  const email = footer?.email ?? settings?.email ?? ''
  const indexHref = '/projects'

  return (
    <>
      <ProjectScene projects={manifest} />
      <GradientOverlays />
      <SiteHeader nav={nav} brandName={brandName} contactHref={contactHref} />
      <SiteFooter email={email} indexHref={indexHref} />
    </>
  )
}
