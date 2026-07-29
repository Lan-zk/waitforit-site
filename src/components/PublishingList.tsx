import Link from 'next/link'

import styles from './PublishingList.module.css'

export interface PublishingListItem {
  href: string
  meta?: string
  summary?: string | null
  title: string
}

export function PublishingList({ items }: { items: PublishingListItem[] }) {
  return (
    <ol className={styles.list}>
      {items.map((item, index) => (
        <li className={styles.item} key={item.href}>
          <Link className={styles.link} href={item.href}>
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
