import { describe, expect, it } from 'vitest'

import {
  filterPublicNavigation,
  normalizeHttpURL,
  withNovelNavigation,
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

  it('adds the novel route before the resume route without duplicating it', () => {
    expect(
      withNovelNavigation([
        { href: '/projects', label: 'Work' },
        { href: '/blog', label: 'Blog' },
        { href: '/resume', label: 'Resume' },
      ]),
    ).toEqual([
      { href: '/projects', label: 'Work' },
      { href: '/blog', label: 'Blog' },
      { href: '/novel', label: 'Novel' },
      { href: '/resume', label: 'Resume' },
    ])

    const existing = [
      { href: '/novel', label: 'Fiction' },
      { href: '/resume', label: 'Resume' },
    ]

    expect(withNovelNavigation(existing)).toEqual(existing)
  })
})
