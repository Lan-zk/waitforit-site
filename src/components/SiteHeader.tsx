'use client'

import Link from 'next/link'

import { setLocale } from '@/app/(frontend)/actions'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries'

import { BrandMark } from './BrandMark'
import styles from './SiteHeader.module.css'

interface NavItem {
  label: string
  href: string
}

interface HeaderLabels {
  email: string
  github: string
  home: string
  language: Dictionary['language']
  navigation: string
}

interface SiteHeaderProps {
  nav: NavItem[]
  brandName: string
  emailHref?: string
  githubHref?: string
  labels: HeaderLabels
  locale: Locale
  variant?: 'document' | 'scene'
}

function PillLink({ href, label }: { href: string; label: string }) {
  return (
    <a className={styles.pill} href={href}>
      <span className={styles.labelTrack}>
        <span>{label}</span>
        <span aria-hidden="true">{label}</span>
      </span>
    </a>
  )
}

function HomeLink({
  label,
  mobile = false,
}: {
  label: string
  mobile?: boolean
}) {
  return (
    <Link
      aria-label={label}
      className={`${styles.homeLink} ${mobile ? styles.mobileHomeLink : ''}`}
      href="/"
    >
      <BrandMark className={styles.brandMark} />
    </Link>
  )
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.477 2 2 6.59 2 12.253c0 4.53 2.865 8.374 6.839 9.73.5.095.682-.222.682-.494 0-.244-.009-.889-.014-1.745-2.782.62-3.369-1.374-3.369-1.374-.455-1.184-1.11-1.499-1.11-1.499-.908-.636.069-.623.069-.623 1.004.073 1.532 1.057 1.532 1.057.892 1.567 2.341 1.115 2.91.852.091-.663.349-1.115.635-1.371-2.221-.259-4.556-1.14-4.556-5.069 0-1.12.389-2.035 1.029-2.752-.103-.26-.446-1.303.098-2.714 0 0 .84-.276 2.75 1.051A9.303 9.303 0 0 1 12 6.976a9.29 9.29 0 0 1 2.504.346c1.909-1.327 2.748-1.051 2.748-1.051.546 1.411.203 2.454.1 2.714.64.717 1.027 1.632 1.027 2.752 0 3.939-2.339 4.807-4.566 5.061.359.317.679.945.679 1.905 0 1.374-.013 2.482-.013 2.819 0 .274.18.594.688.493C19.138 20.625 22 16.783 22 12.253 22 6.59 17.523 2 12 2Z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function ContactLinks({
  emailHref,
  githubHref,
  labels,
  mobile = false,
}: {
  emailHref?: string
  githubHref?: string
  labels: Pick<HeaderLabels, 'email' | 'github'>
  mobile?: boolean
}) {
  if (!emailHref && !githubHref) {
    return null
  }

  return (
    <div
      className={`${styles.contactLinks} ${mobile ? styles.mobileContactLinks : ''}`}
    >
      {githubHref ? (
        <a
          aria-label={labels.github}
          className={styles.iconLink}
          href={githubHref}
          rel="noreferrer"
          target="_blank"
        >
          <GitHubIcon />
        </a>
      ) : null}
      {emailHref ? (
        <a
          aria-label={labels.email}
          className={styles.iconLink}
          href={emailHref}
        >
          <EmailIcon />
        </a>
      ) : null}
    </div>
  )
}

export function LanguageSwitcher({
  labels,
  locale,
  mobile = false,
  standalone = false,
}: {
  labels: Dictionary['language']
  locale: Locale
  mobile?: boolean
  standalone?: boolean
}) {
  return (
    <form
      action={setLocale}
      aria-label={labels.ariaLabel}
      className={`${styles.languageSwitcher} ${mobile ? styles.mobileLanguageSwitcher : ''} ${standalone ? styles.standaloneLanguageSwitcher : ''}`}
    >
      <button
        aria-label={labels.switchToSimplifiedChinese}
        aria-pressed={locale === 'zh-CN'}
        className={locale === 'zh-CN' ? styles.activeLanguage : undefined}
        name="locale"
        type="submit"
        value="zh-CN"
      >
        {labels.simplifiedChinese}
      </button>
      <span aria-hidden="true">/</span>
      <button
        aria-label={labels.switchToEnglish}
        aria-pressed={locale === 'en'}
        className={locale === 'en' ? styles.activeLanguage : undefined}
        name="locale"
        type="submit"
        value="en"
      >
        {labels.english}
      </button>
    </form>
  )
}

export function SiteHeader({
  nav,
  brandName,
  emailHref,
  githubHref,
  labels,
  locale,
  variant = 'scene',
}: SiteHeaderProps) {
  return (
    <header
      className={`${styles.siteHeader} ${
        variant === 'scene' ? styles.sceneHeader : styles.documentHeader
      }`}
    >
      <div className={styles.desktopHeader} data-header-layout="desktop">
        <div className={styles.leftGroup}>
          <HomeLink label={labels.home} />
          <nav aria-label={labels.navigation} className={styles.navigation}>
            {nav.map((item) => (
              <PillLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        <Link className={styles.wordmark} href="/">
          {brandName}
        </Link>

        <div className={styles.rightGroup}>
          <ContactLinks
            emailHref={emailHref}
            githubHref={githubHref}
            labels={labels}
          />
          <LanguageSwitcher labels={labels.language} locale={locale} />
        </div>
      </div>

      <div className={styles.mobileHeader} data-header-layout="mobile">
        <HomeLink label={labels.home} mobile />
        <LanguageSwitcher labels={labels.language} locale={locale} mobile />
        <nav
          aria-label={labels.navigation}
          className={styles.mobileNavigation}
        >
          {nav.map((item) => (
            <PillLink key={item.href} {...item} />
          ))}
          <ContactLinks
            emailHref={emailHref}
            githubHref={githubHref}
            labels={labels}
            mobile
          />
        </nav>
      </div>
    </header>
  )
}
