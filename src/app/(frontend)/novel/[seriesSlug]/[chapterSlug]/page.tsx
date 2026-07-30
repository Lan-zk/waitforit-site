import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { ChapterNavigation } from '@/components/ChapterNavigation'
import { ContentPage } from '@/components/ContentPage'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { ReadingBackground } from '@/components/ReadingBackground'
import { ContentFileError } from '@/content/paths'
import { readMarkdownFile } from '@/content/readMarkdown'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function NovelChapter({
  params,
}: {
  params: Promise<{ chapterSlug: string; seriesSlug: string }>
}) {
  const { chapterSlug, seriesSlug } = await params
  const payload = await getPayload({ config })
  const seriesResult = await payload.find({
    collection: 'series',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: seriesSlug } },
  })
  const series = seriesResult.docs[0]
  if (!series) notFound()

  const [chapterResult, chapterList, { dictionary }] =
    await Promise.all([
      payload.find({
        collection: 'writings',
        depth: 0,
        limit: 1,
        overrideAccess: false,
        where: {
          and: [
            { chapterOrder: { exists: true } },
            { kind: { equals: 'novelChapter' } },
            { series: { equals: series.id } },
            { slug: { equals: chapterSlug } },
          ],
        },
      }),
      payload.find({
        collection: 'writings',
        depth: 0,
        limit: 1000,
        overrideAccess: false,
        sort: 'chapterOrder',
        where: {
          and: [
            { kind: { equals: 'novelChapter' } },
            { series: { equals: series.id } },
          ],
        },
        select: { slug: true, title: true },
      }),
      getI18n(),
    ])
  const chapter = chapterResult.docs[0]
  if (!chapter) notFound()

  let markdown: string
  try {
    markdown = await readMarkdownFile(chapter.sourcePath)
  } catch (error) {
    if (
      error instanceof ContentFileError &&
      error.code !== 'MISSING_CONTENT_ROOT'
    ) {
      notFound()
    }
    throw error
  }

  const currentIndex = chapterList.docs.findIndex(
    (item) => item.id === chapter.id,
  )
  const previous = currentIndex > 0 ? chapterList.docs[currentIndex - 1] : null
  const next =
    currentIndex >= 0 && currentIndex < chapterList.docs.length - 1
      ? chapterList.docs[currentIndex + 1]
      : null

  return (
    <ContentPage
      background={<ReadingBackground kind="novel" />}
      backHref={`/novel/${series.slug}`}
      homeLabel={dictionary.pages.backNovel}
      title={chapter.title}
      description={series.title}
      variant="reading"
    >
      <article lang={chapter.language}>
        <MarkdownRenderer
          documentTitle={chapter.title}
          externalLinkLabel={dictionary.pages.externalLink}
          markdown={markdown}
          sourcePath={chapter.sourcePath}
        />
      </article>
      <ChapterNavigation
        next={
          next
            ? {
                href: `/novel/${series.slug}/${next.slug}`,
                label: dictionary.pages.nextChapter,
                title: next.title,
              }
            : undefined
        }
        previous={
          previous
            ? {
                href: `/novel/${series.slug}/${previous.slug}`,
                label: dictionary.pages.previousChapter,
                title: previous.title,
              }
            : undefined
        }
      />
    </ContentPage>
  )
}
