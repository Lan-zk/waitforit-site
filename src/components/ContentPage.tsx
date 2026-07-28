import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'

import styles from './ContentPage.module.css'
import { LanguageSwitcher } from './SiteHeader'

interface ContentPageProps {
  children: ReactNode
  homeLabel: string
  languageLabels: Dictionary['language']
  locale: Locale
  title: string
}

export function ContentPage({
  children,
  homeLabel,
  languageLabels,
  locale,
  title,
}: ContentPageProps) {
  return (
    <main className={styles.page}>
      <Link className={styles.homeLink} href="/">
        {homeLabel}
      </Link>
      <LanguageSwitcher labels={languageLabels} locale={locale} standalone />
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.content}>{children}</div>
    </main>
  )
}
