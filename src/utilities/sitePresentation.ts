interface NavigationInput {
  href?: null | string
  label?: null | string
}

export interface PublicNavigationItem {
  href: string
  label: string
}

export const DEFAULT_GITHUB_URL = 'https://github.com/Lan-zk'

export function isPhotographyHref(href: string): boolean {
  return href === '/photography' || href.startsWith('/photography/')
}

function normalizeNavigationHref(value: string): null | string {
  if (value.startsWith('/') && !value.startsWith('//')) {
    return value
  }

  return normalizeHttpURL(value)
}

export function filterPublicNavigation(
  items: NavigationInput[] | null | undefined,
): PublicNavigationItem[] {
  return (items ?? []).flatMap((item) => {
    const href = item.href ? normalizeNavigationHref(item.href.trim()) : null
    const label = item.label?.trim()

    if (!href || !label || isPhotographyHref(href)) {
      return []
    }

    return [{ href, label }]
  })
}

export function withNovelNavigation(
  items: PublicNavigationItem[],
): PublicNavigationItem[] {
  if (items.some(({ href }) => href === '/novel')) {
    return items
  }

  const resumeIndex = items.findIndex(({ href }) => href === '/resume')
  const novelItem = { href: '/novel', label: 'Novel' }

  if (resumeIndex === -1) {
    return [...items, novelItem]
  }

  return [
    ...items.slice(0, resumeIndex),
    novelItem,
    ...items.slice(resumeIndex),
  ]
}

export function normalizeHttpURL(
  value: null | string | undefined,
): null | string {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : null
  } catch {
    return null
  }
}
