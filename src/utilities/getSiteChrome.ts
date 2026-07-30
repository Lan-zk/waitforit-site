import config from '@payload-config'
import { cache } from 'react'
import { getPayload } from 'payload'

import {
  DEFAULT_GITHUB_URL,
  filterPublicNavigation,
  normalizeHttpURL,
  type PublicNavigationItem,
  withNovelNavigation,
} from './sitePresentation'

export interface SiteChromeData {
  brandName: string
  copyright: string
  description: string
  email: string
  footerNav: PublicNavigationItem[]
  githubURL: string
  headerNav: PublicNavigationItem[]
  siteURL: null | string
  social: Array<{
    label: string
    url: string
  }>
}

export const getSiteChrome = cache(async (): Promise<SiteChromeData> => {
  const payload = await getPayload({ config })
  const [header, footer, settings] = await Promise.all([
    payload.findGlobal({
      slug: 'header',
      overrideAccess: false,
      select: {
        nav: true,
      },
    }),
    payload.findGlobal({
      slug: 'footer',
      overrideAccess: false,
      select: {
        copyright: true,
        email: true,
        nav: true,
      },
    }),
    payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: false,
      select: {
        description: true,
        email: true,
        name: true,
        social: true,
        url: true,
      },
    }),
  ])

  const social = (settings.social ?? []).flatMap((item) => {
    const label = item.label?.trim()
    const url = normalizeHttpURL(item.url)

    return label && url ? [{ label, url }] : []
  })

  return {
    brandName: settings.name?.trim() || 'Wait For It',
    copyright: footer.copyright?.trim() || '',
    description: settings.description?.trim() || '',
    email: footer.email?.trim() || settings.email?.trim() || '',
    footerNav: filterPublicNavigation(footer.nav),
    githubURL:
      social.find(({ label, url }) => {
        const hostname = new URL(url).hostname.toLowerCase()

        return (
          label.toLowerCase() === 'github' ||
          hostname === 'github.com' ||
          hostname === 'www.github.com'
        )
      })?.url ?? DEFAULT_GITHUB_URL,
    headerNav: withNovelNavigation(filterPublicNavigation(header.nav)),
    siteURL: normalizeHttpURL(settings.url),
    social,
  }
})
