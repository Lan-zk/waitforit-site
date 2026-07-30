import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { ContentPage } from '@/components/ContentPage'
import { ProjectDetailView } from '@/components/ProjectDetailView'
import { getI18n } from '@/i18n/server'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    select: {
      cover: true,
      externalURL: true,
      repositoryURL: true,
      summary: true,
      technologies: true,
      title: true,
    },
    where: { slug: { equals: slug } },
  })
  const doc = docs[0]
  if (!doc) notFound()
  const { dictionary } = await getI18n()

  return (
    <ContentPage
      homeLabel={dictionary.pages.backHome}
      title={doc.title}
      variant="project"
    >
      <ProjectDetailView
        labels={{
          external: dictionary.pages.projectExternal,
          repository: dictionary.pages.projectRepository,
          technologies: dictionary.pages.projectTechnologies,
        }}
        project={doc}
      />
    </ContentPage>
  )
}
