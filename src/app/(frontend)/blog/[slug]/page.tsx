import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { ReadingBackground } from '@/components/ReadingBackground'
import { ContentFileError } from '@/content/paths'
import { readMarkdownFile } from '@/content/readMarkdown'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function PostDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'writings',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ kind: { equals: 'blog' } }, { slug: { equals: slug } }],
    },
  })
  const doc = docs[0]
  if (!doc) notFound()
  const { dictionary } = await getI18n()
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
      background={<ReadingBackground kind="blog" />}
      backHref="/blog"
      homeLabel={dictionary.pages.backBlog}
      title={doc.title}
      description={doc.summary ?? undefined}
      variant="reading"
    >
      <article lang={doc.language}>
        <MarkdownRenderer
          documentTitle={doc.title}
          externalLinkLabel={dictionary.pages.externalLink}
          markdown={markdown}
          revealOnScroll
          sourcePath={doc.sourcePath}
        />
      </article>
    </ContentPage>
  )
}
