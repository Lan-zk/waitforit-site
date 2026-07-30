import Link from 'next/link'
import type { ReactNode } from 'react'

import { getNavigationLabel } from '@/i18n/dictionaries'
import { getI18n } from '@/i18n/server'
import { getSiteChrome } from '@/utilities/getSiteChrome'

import styles from './ContentPage.module.css'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

interface ContentPageProps {
  background?: ReactNode
  backHref?: string
  children: ReactNode
  description?: string
  homeLabel: string
  title: string
  variant?: 'default' | 'project' | 'reading' | 'resume'
}

export async function ContentPage({
  background,
  backHref = '/',
  children,
  description,
  homeLabel,
  title,
  variant = 'default',
}: ContentPageProps) {
  const [site, { dictionary, locale }] = await Promise.all([
    getSiteChrome(),
    getI18n(),
  ])
  const headerNav = site.headerNav.map((item) => ({
    href: item.href,
    label: getNavigationLabel(dictionary, item.href, item.label),
  }))
  const footerNav = site.footerNav.map((item) => ({
    href: item.href,
    label: getNavigationLabel(dictionary, item.href, item.label),
  }))

  return (
    <>
      <SiteHeader
        brandName={site.brandName}
        contactHref={site.email ? `mailto:${site.email}` : undefined}
        labels={{
          contact: dictionary.navigation.contact,
          home: dictionary.navigation.home,
          language: dictionary.language,
          localTime: dictionary.time.localTime,
          navigation: dictionary.navigation.ariaLabel,
        }}
        locale={locale}
        nav={headerNav}
        variant="document"
      />
      {background}
      <main className={`${styles.page} ${styles[`${variant}Page`]}`}>
        <Link className={styles.homeLink} href={backHref}>
          {homeLabel}
        </Link>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </header>
        <div className={styles.content}>{children}</div>
      </main>
      <SiteFooter
        copyright={site.copyright}
        description={site.description}
        email={site.email}
        nav={footerNav}
        social={site.social}
        variant="document"
      />
    </>
  )
}
