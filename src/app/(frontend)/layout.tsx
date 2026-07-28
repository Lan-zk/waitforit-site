import type { Metadata } from 'next'
import React from 'react'

import { getI18n } from '@/i18n/server'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getI18n()

  return {
    description: dictionary.metadata.description,
    title: dictionary.metadata.title,
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
