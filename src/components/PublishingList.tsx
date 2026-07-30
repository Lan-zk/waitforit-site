'use client'

import Link from 'next/link'
import type { PointerEvent } from 'react'

import styles from './PublishingList.module.css'

export interface PublishingListItem {
  href: string
  meta?: string
  summary?: string | null
  title: string
}

interface PublishingListProps {
  items: PublishingListItem[]
  variant?: 'row' | 'spotlight'
}

function updateSpotlight(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType === 'touch') {
    return
  }

  const rect = event.currentTarget.getBoundingClientRect()

  event.currentTarget.style.setProperty(
    '--spotlight-x',
    `${event.clientX - rect.left}px`,
  )
  event.currentTarget.style.setProperty(
    '--spotlight-y',
    `${event.clientY - rect.top}px`,
  )
  event.currentTarget.style.setProperty('--spotlight-opacity', '1')
}

function clearSpotlight(event: PointerEvent<HTMLAnchorElement>) {
  event.currentTarget.style.setProperty('--spotlight-opacity', '0')
}

export function PublishingList({
  items,
  variant = 'row',
}: PublishingListProps) {
  const spotlight = variant === 'spotlight'

  return (
    <ol className={`${styles.list} ${spotlight ? styles.spotlightList : ''}`}>
      {items.map((item, index) => (
        <li
          className={`${styles.item} ${spotlight ? styles.spotlightItem : ''}`}
          key={item.href}
        >
          <Link
            className={`${styles.link} ${spotlight ? styles.spotlightLink : ''}`}
            data-spotlight-card={spotlight ? '' : undefined}
            href={item.href}
            onPointerLeave={spotlight ? clearSpotlight : undefined}
            onPointerMove={spotlight ? updateSpotlight : undefined}
          >
            <span aria-hidden="true" className={styles.index}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={styles.copy}>
              <span className={styles.title}>{item.title}</span>
              {item.summary ? (
                <span className={styles.summary}>{item.summary}</span>
              ) : null}
            </span>
            {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
            <span aria-hidden="true" className={styles.arrow}>
              ↗
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
