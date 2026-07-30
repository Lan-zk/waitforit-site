interface NavigationInput {
  href?: null | string
  label?: null | string
}

export interface PublicNavigationItem {
  href: string
  label: string
}

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
