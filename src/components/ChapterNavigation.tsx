import Link from 'next/link'

import styles from './ChapterNavigation.module.css'

interface ChapterNavigationProps {
  next?: { href: string; label: string; title: string }
  previous?: { href: string; label: string; title: string }
}

export function ChapterNavigation({
  next,
  previous,
}: ChapterNavigationProps) {
  if (!previous && !next) return null
  return (
    <nav className={styles.navigation}>
      {previous ? (
        <Link className={styles.link} href={previous.href}>
          <span className={styles.label}>← {previous.label}</span>
          <span className={styles.title}>{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className={`${styles.link} ${styles.next}`} href={next.href}>
          <span className={styles.label}>{next.label} →</span>
          <span className={styles.title}>{next.title}</span>
        </Link>
      ) : null}
    </nav>
  )
}
