'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

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
  contact: string
  home: string
  language: Dictionary['language']
  localTime: string
  navigation: string
}

interface SiteHeaderProps {
  nav: NavItem[]
  brandName: string
  contactHref: string
  labels: HeaderLabels
  locale: Locale
}

function formatLocalTime(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    hour12: locale === 'en',
    minute: '2-digit',
  }).format(date)
}

function useLocalTime(locale: Locale) {
  const [time, setTime] = useState('')

  useEffect(() => {
    let minuteTimer: ReturnType<typeof setInterval> | undefined

    const updateTime = () => setTime(formatLocalTime(new Date(), locale))
    const now = new Date()
    const millisecondsUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    updateTime()

    const alignmentTimer = window.setTimeout(() => {
      updateTime()
      minuteTimer = setInterval(updateTime, 60_000)
    }, millisecondsUntilNextMinute)

    return () => {
      window.clearTimeout(alignmentTimer)
      if (minuteTimer) clearInterval(minuteTimer)
    }
  }, [locale])

  return time
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

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.globeIcon}
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="6.35" />
      <path d="M1.9 8h12.2M8 1.65c1.7 1.73 2.55 3.85 2.55 6.35S9.7 12.62 8 14.35M8 1.65C6.3 3.38 5.45 5.5 5.45 8S6.3 12.62 8 14.35" />
    </svg>
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
  contactHref,
  labels,
  locale,
}: SiteHeaderProps) {
  const time = useLocalTime(locale)

  return (
    <header className={styles.siteHeader}>
      <div className={styles.desktopHeader}>
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
          <PillLink href={contactHref} label={labels.contact} />
          <LanguageSwitcher labels={labels.language} locale={locale} />
          <div
            aria-label={time ? `${labels.localTime} ${time}` : labels.localTime}
            className={styles.timeCapsule}
          >
            <span className={styles.desktopTime}>{time || '\u00a0'}</span>
            <GlobeIcon />
          </div>
        </div>
      </div>

      <div className={styles.mobileHeader}>
        <time className={styles.mobileTime}>{time || '\u00a0'}</time>
        <HomeLink label={labels.home} mobile />
        <LanguageSwitcher labels={labels.language} locale={locale} mobile />
      </div>
    </header>
  )
}
