import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { PublishingList } from '@/components/PublishingList'
import { ContentFileError } from '@/content/paths'
import { readMarkdownFile } from '@/content/readMarkdown'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function NovelDetail({
  params,
}: {
  params: Promise<{ seriesSlug: string }>
}) {
  const { seriesSlug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'series',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: seriesSlug } },
  })
  const doc = docs[0]
  if (!doc) notFound()
  const [{ dictionary }, chapters] = await Promise.all([
    getI18n(),
    payload.find({
      collection: 'writings',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      sort: 'chapterOrder',
      where: {
        and: [
          { kind: { equals: 'novelChapter' } },
          { series: { equals: doc.id } },
        ],
      },
      select: { chapterOrder: true, slug: true, title: true },
    }),
  ])
  let markdown: string
  try {
    markdown = await readMarkdownFile(doc.sourcePath)
  } catch (error) {
    if (
      error instanceof ContentFileError &&
      error.code !== 'MISSING_CONTENT_ROOT'
    ) {
      notFound()
    }
    throw error
  }

  return (
    <ContentPage
      backHref="/novel"
      homeLabel={dictionary.pages.backNovel}
      title={doc.title}
      description={doc.summary ?? undefined}
    >
      <article lang={doc.language}>
        <MarkdownRenderer
          documentTitle={doc.title}
          externalLinkLabel={dictionary.pages.externalLink}
          markdown={markdown}
          sourcePath={doc.sourcePath}
        />
      </article>
      <section aria-labelledby="chapter-list-title">
        <h2 id="chapter-list-title">{dictionary.pages.chapters}</h2>
        {chapters.docs.length === 0 ? (
          <p>{dictionary.pages.empty}</p>
        ) : (
          <PublishingList
            items={chapters.docs.map((chapter) => ({
              href: `/novel/${doc.slug}/${chapter.slug}`,
              title: chapter.title,
            }))}
          />
        )}
      </section>
    </ContentPage>
  )
}
