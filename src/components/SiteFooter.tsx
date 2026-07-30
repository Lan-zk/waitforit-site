import type { PublicNavigationItem } from '@/utilities/sitePresentation'

import styles from './SiteFooter.module.css'

function SwappingLabel({ children }: { children: string }) {
  return (
    <span className={styles.labelViewport}>
      <span className={styles.labelTrack}>
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  )
}

interface SceneFooterProps {
  email: string
  indexHref: string
  labels: {
    index: string
    overview: string
  }
  variant?: 'scene'
}

interface DocumentFooterProps {
  copyright: string
  description: string
  email: string
  nav: PublicNavigationItem[]
  social: Array<{
    label: string
    url: string
  }>
  variant: 'document'
}

type SiteFooterProps = DocumentFooterProps | SceneFooterProps

export function SiteFooter(props: SiteFooterProps) {
  if (props.variant === 'document') {
    const { copyright, description, email, nav, social } = props

    return (
      <footer className={`${styles.siteFooter} ${styles.documentFooter}`}>
        <div className={styles.documentIntro}>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
          {email ? (
            <a className={styles.documentEmail} href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}
        </div>

        {nav.length > 0 ? (
          <nav aria-label="Footer" className={styles.documentNav}>
            {nav.map((item) => (
              <a href={item.href} key={`${item.href}-${item.label}`}>
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className={styles.documentMeta}>
          {copyright ? <span>{copyright}</span> : <span aria-hidden="true" />}
          {social.length > 0 ? (
            <div className={styles.socialLinks}>
              {social.map((item) => (
                <a
                  href={item.url}
                  key={`${item.url}-${item.label}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </footer>
    )
  }

  const { email, indexHref, labels } = props

  return (
    <footer className={`${styles.siteFooter} ${styles.sceneFooter}`}>
      {email ? (
        <a className={styles.emailLink} href={`mailto:${email}`}>
          {email}
        </a>
      ) : (
        <span aria-hidden="true" />
      )}

      <div className={styles.footerActions}>
        <span className={styles.sceneLabel}>{labels.overview}</span>

        <a className={styles.indexLink} href={indexHref}>
          <SwappingLabel>{labels.index}</SwappingLabel>
        </a>
      </div>
    </footer>
  )
}
