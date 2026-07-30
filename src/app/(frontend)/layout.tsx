import type { Metadata } from 'next'
import React from 'react'

import { getI18n } from '@/i18n/server'
import { getSiteChrome } from '@/utilities/getSiteChrome'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const [{ dictionary }, site] = await Promise.all([
    getI18n(),
    getSiteChrome(),
  ])
  const title = site.brandName || dictionary.metadata.title
  const description = site.description || dictionary.metadata.description
  const metadataBase = site.siteURL ? new URL(site.siteURL) : undefined

  return {
    alternates: metadataBase ? { canonical: '/' } : undefined,
    description,
    metadataBase,
    openGraph: {
      description,
      title,
      type: 'website',
      url: metadataBase ? '/' : undefined,
    },
    title,
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { locale } = await getI18n()

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
