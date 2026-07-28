import type { Locale } from './config'

const dictionaries = {
  'zh-CN': {
    metadata: {
      description: '个人内容与作品网站',
      title: 'Wait For It',
    },
    navigation: {
      ariaLabel: '主导航',
      blog: '博客',
      contact: '联系',
      home: '首页',
      novel: '小说',
      photography: '摄影',
      projects: '作品',
      resume: '简历',
    },
    language: {
      ariaLabel: '选择语言',
      english: 'EN',
      simplifiedChinese: '中',
      switchToEnglish: '切换为英语',
      switchToSimplifiedChinese: '切换为简体中文',
    },
    time: {
      localTime: '本地时间',
    },
    footer: {
      index: '索引',
      overview: '总览',
    },
    pages: {
      backHome: '返回首页',
      blog: '博客',
      empty: '暂无内容',
      novel: '小说',
      notFoundBody: '你访问的内容不存在或已被移除。',
      notFoundTitle: '页面未找到',
      photography: '摄影',
      projects: '作品',
      resume: '简历',
      shell: '内容待补',
    },
  },
  en: {
    metadata: {
      description: 'Personal publishing and portfolio site',
      title: 'Wait For It',
    },
    navigation: {
      ariaLabel: 'Primary navigation',
      blog: 'Blog',
      contact: 'Contact',
      home: 'Home',
      novel: 'Novel',
      photography: 'Photography',
      projects: 'Work',
      resume: 'Resume',
    },
    language: {
      ariaLabel: 'Select language',
      english: 'EN',
      simplifiedChinese: '中',
      switchToEnglish: 'Switch to English',
      switchToSimplifiedChinese: 'Switch to Simplified Chinese',
    },
    time: {
      localTime: 'Local time',
    },
    footer: {
      index: 'Index',
      overview: 'Overview',
    },
    pages: {
      backHome: 'Back home',
      blog: 'Blog',
      empty: 'No content yet',
      novel: 'Novel',
      notFoundBody: 'The content you requested does not exist or has been removed.',
      notFoundTitle: 'Page not found',
      photography: 'Photography',
      projects: 'Projects',
      resume: 'Resume',
      shell: 'Content coming soon',
    },
  },
} as const

export type Dictionary = (typeof dictionaries)[Locale]

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function getNavigationLabel(
  dictionary: Dictionary,
  href: string,
  fallback: string,
): string {
  const labels: Record<string, string> = {
    '/': dictionary.navigation.home,
    '/blog': dictionary.navigation.blog,
    '/novel': dictionary.navigation.novel,
    '/photography': dictionary.navigation.photography,
    '/projects': dictionary.navigation.projects,
    '/resume': dictionary.navigation.resume,
  }

  return labels[href] ?? fallback
}
