import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'

import styles from './ContentPage.module.css'
import { LanguageSwitcher } from './SiteHeader'

interface ContentPageProps {
  backHref?: string
  children: ReactNode
  description?: string
  homeLabel: string
  languageLabels: Dictionary['language']
  locale: Locale
  title: string
}

export function ContentPage({
  backHref = '/',
  children,
  description,
  homeLabel,
  languageLabels,
  locale,
  title,
}: ContentPageProps) {
  return (
    <main className={styles.page}>
      <Link className={styles.homeLink} href={backHref}>
        {homeLabel}
      </Link>
      <LanguageSwitcher labels={languageLabels} locale={locale} standalone />
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </header>
      <div className={styles.content}>{children}</div>
    </main>
  )
}
