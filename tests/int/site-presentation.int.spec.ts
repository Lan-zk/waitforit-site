import { describe, expect, it } from 'vitest'

import {
  filterPublicNavigation,
  normalizeHttpURL,
} from '@/utilities/sitePresentation'

describe('site presentation', () => {
  it('removes photography discovery and incomplete links', () => {
    expect(
      filterPublicNavigation([
        { href: '/projects', label: 'Projects' },
        { href: '/photography', label: 'Photography' },
        { href: '/photography/one', label: 'Photo' },
        { href: '', label: 'Empty' },
        { href: '/blog', label: '  ' },
        { href: 'javascript:alert(1)', label: 'Unsafe' },
      ]),
    ).toEqual([{ href: '/projects', label: 'Projects' }])
  })

  it('trims public navigation values without removing other routes', () => {
    expect(
      filterPublicNavigation([
        { href: ' /resume ', label: ' Resume ' },
        { href: 'https://example.com/work', label: 'External' },
      ]),
    ).toEqual([
      { href: '/resume', label: 'Resume' },
      { href: 'https://example.com/work', label: 'External' },
    ])
  })

  it('accepts only absolute HTTP and HTTPS URLs', () => {
    expect(normalizeHttpURL('https://example.com/path')).toBe(
      'https://example.com/path',
    )
    expect(normalizeHttpURL('http://example.com')).toBe('http://example.com/')
    expect(normalizeHttpURL('javascript:alert(1)')).toBeNull()
    expect(normalizeHttpURL('/projects')).toBeNull()
    expect(normalizeHttpURL('')).toBeNull()
  })
})
