export type WritingKind = 'blog' | 'novelChapter'

export interface BlogMetadata {
  coverPath?: string
  kind: 'blog'
  language: string
  publishedAt?: string
  slug: string
  sourcePath: string
  summary?: string
  title: string
}

export interface SeriesMetadata {
  coverPath?: string
  language: string
  publishedAt?: string
  slug: string
  sourcePath: string
  summary?: string
  title: string
}

export interface ChapterMetadata {
  chapterOrder: number
  kind: 'novelChapter'
  language: string
  seriesSlug: string
  slug: string
  sourcePath: string
  title: string
}

export interface ContentRepositoryScan {
  blogs: BlogMetadata[]
  chapters: ChapterMetadata[]
  series: SeriesMetadata[]
}

export type WritingMetadata = BlogMetadata | ChapterMetadata
