import { describe, expect, it } from 'vitest'

import payloadConfig from '@/payload.config'
import { defaultLocale, isLocale, resolveLocale } from '@/i18n/config'
import { getDictionary, getNavigationLabel } from '@/i18n/dictionaries'

describe('public UI locale', () => {
  it('defaults unknown and malformed values to Simplified Chinese', () => {
    expect(defaultLocale).toBe('zh-CN')
    expect(resolveLocale(undefined)).toBe('zh-CN')
    expect(resolveLocale('fr')).toBe('zh-CN')
    expect(resolveLocale('EN')).toBe('zh-CN')
  })

  it('accepts only the two supported locale identifiers', () => {
    expect(isLocale('zh-CN')).toBe(true)
    expect(isLocale('en')).toBe(true)
    expect(isLocale('zh')).toBe(false)
    expect(isLocale(null)).toBe(false)
  })

  it('translates known navigation routes and preserves custom CMS labels', () => {
    const chinese = getDictionary('zh-CN')
    const english = getDictionary('en')

    expect(getNavigationLabel(chinese, '/projects', 'Work')).toBe('作品')
    expect(getNavigationLabel(english, '/projects', 'Work')).toBe('Work')
    expect(getNavigationLabel(chinese, '/custom', '自定义')).toBe('自定义')
  })
})

describe('Payload Admin locale', () => {
  it('uses Chinese as the fallback and exposes Chinese and English', async () => {
    const config = await payloadConfig

    expect(config.i18n.fallbackLanguage).toBe('zh')
    expect(Object.keys(config.i18n.supportedLanguages)).toEqual(['zh', 'en'])
  })

  it('provides translated labels for project-owned Admin UI', async () => {
    const config = await payloadConfig
    const projects = config.collections.find(({ slug }) => slug === 'projects')
    const siteSettings = config.globals.find(({ slug }) => slug === 'site-settings')

    expect(projects?.labels).toMatchObject({
      singular: { en: 'Project', zh: '项目' },
      plural: { en: 'Projects', zh: '项目' },
    })
    expect(projects?.fields.find(({ name }) => name === 'title')?.label).toEqual({
      en: 'Title',
      zh: '标题',
    })
    expect(projects?.fields.find(({ name }) => name === 'technologies')).toMatchObject({
      labels: {
        singular: { en: 'Technology', zh: '技术' },
        plural: { en: 'Technologies', zh: '技术' },
      },
    })
    expect(siteSettings?.label).toEqual({
      en: 'Site settings',
      zh: '站点设置',
    })
  })
})
