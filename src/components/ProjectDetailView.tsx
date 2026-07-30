import type { Media, Project } from '@/payload-types'
import { normalizeHttpURL } from '@/utilities/sitePresentation'

import styles from './ProjectDetailView.module.css'

interface ProjectDetailLabels {
  external: string
  repository: string
  technologies: string
}

type ProjectDetail = Pick<
  Project,
  | 'cover'
  | 'externalURL'
  | 'repositoryURL'
  | 'summary'
  | 'technologies'
  | 'title'
>

function resolveCover(cover: Media | number): Media | null {
  return typeof cover === 'object' ? cover : null
}

export function ProjectDetailView({
  labels,
  project,
}: {
  labels: ProjectDetailLabels
  project: ProjectDetail
}) {
  const cover = resolveCover(project.cover)
  const coverURL = cover?.sizes?.large?.url ?? cover?.url
  const externalURL = normalizeHttpURL(project.externalURL)
  const repositoryURL = normalizeHttpURL(project.repositoryURL)
  const technologies =
    project.technologies?.map((item) => item.name.trim()).filter(Boolean) ?? []

  return (
    <article className={styles.project}>
      {coverURL ? (
        <figure className={styles.cover}>
          {/* Payload controls image dimensions and local media URLs at runtime. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={cover?.alt ?? project.title}
            decoding="async"
            height={cover?.sizes?.large?.height ?? cover?.height ?? undefined}
            src={coverURL}
            width={cover?.sizes?.large?.width ?? cover?.width ?? undefined}
          />
        </figure>
      ) : null}

      <div className={styles.information}>
        {project.summary ? (
          <p className={styles.summary}>{project.summary}</p>
        ) : null}

        {technologies.length > 0 ? (
          <section aria-labelledby="project-technologies">
            <h2 className={styles.eyebrow} id="project-technologies">
              {labels.technologies}
            </h2>
            <ul className={styles.technologies}>
              {technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {externalURL || repositoryURL ? (
          <div className={styles.actions}>
            {externalURL ? (
              <a
                className={styles.primaryAction}
                href={externalURL}
                rel="noopener noreferrer"
                target="_blank"
              >
                {labels.external}
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            {repositoryURL ? (
              <a
                className={styles.secondaryAction}
                href={repositoryURL}
                rel="noopener noreferrer"
                target="_blank"
              >
                {labels.repository}
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
