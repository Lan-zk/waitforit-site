import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Media, Project, Resume } from '@/payload-types'

import styles from './ResumeView.module.css'

type ResumeData = Pick<
  Resume,
  | 'coreCapabilities'
  | 'currentFocus'
  | 'governanceCases'
  | 'positioning'
  | 'professionalProjects'
  | 'publicProducts'
  | 'skillGroups'
>

interface ResumeViewProps {
  email?: string
  resume: ResumeData
  supplement?: ReactNode
}

function formatYears(start?: null | number, end?: null | number): string {
  if (start && end && start !== end) return `${start}—${end}`
  return String(start ?? end ?? '')
}

function projectFromRelationship(value: number | Project): Project | null {
  return typeof value === 'object' ? value : null
}

function mediaFromRelationship(value: Media | number): Media | null {
  return typeof value === 'object' ? value : null
}

export function hasStructuredResume(resume: ResumeData): boolean {
  const positioning = resume.positioning

  return Boolean(
    positioning?.displayName ||
      positioning?.headline ||
      positioning?.summary ||
      positioning?.experienceYears !== undefined ||
      resume.coreCapabilities?.length ||
      resume.professionalProjects?.length ||
      resume.publicProducts?.length ||
      resume.governanceCases?.length ||
      resume.skillGroups?.length ||
      resume.currentFocus?.length,
  )
}

export function ResumeView({
  email,
  resume,
  supplement,
}: ResumeViewProps) {
  const positioning = resume.positioning
  const publicProducts =
    resume.publicProducts?.flatMap((value) => {
      const project = projectFromRelationship(value)
      return project ? [project] : []
    }) ?? []

  return (
    <article className={styles.resume} lang="zh-CN">
      {positioning ? (
        <section className={`${styles.section} ${styles.identity}`}>
          <div className={styles.identityCopy}>
            <p className={styles.sectionLabel}>01 / 个人定位</p>
            {positioning.displayName ? (
              <h2 className={styles.displayName}>{positioning.displayName}</h2>
            ) : null}
            {positioning.headline ? (
              <p className={styles.headline}>{positioning.headline}</p>
            ) : null}
            {positioning.summary ? (
              <p className={styles.positioningSummary}>
                {positioning.summary}
              </p>
            ) : null}
          </div>
          {typeof positioning.experienceYears === 'number' ? (
            <aside className={styles.experience}>
              <span>工程经验</span>
              <strong>{String(positioning.experienceYears).padStart(2, '0')}</strong>
              <span>年</span>
            </aside>
          ) : null}
        </section>
      ) : null}

      {resume.coreCapabilities?.length ? (
        <section className={styles.capabilities}>
          {resume.coreCapabilities.map((capability, index) => (
            <div className={styles.capability} key={capability.id ?? capability.title}>
              <p className={styles.sectionLabel}>
                {String(index + 2).padStart(2, '0')} / 核心能力
              </p>
              <h2>{capability.title}</h2>
              {capability.tags?.length ? (
                <ul className={styles.tags}>
                  {capability.tags.map((tag) => (
                    <li key={tag.id ?? tag.name}>{tag.name}</li>
                  ))}
                </ul>
              ) : null}
              {capability.summary ? <p>{capability.summary}</p> : null}
            </div>
          ))}
        </section>
      ) : null}

      {resume.professionalProjects?.length ? (
        <section className={styles.section}>
          <p className={styles.sectionLabel}>05 / 匿名职业项目案例</p>
          <div className={styles.caseList}>
            {resume.professionalProjects.map((project, index) => (
              <article className={styles.case} key={project.id ?? project.title}>
                <span aria-hidden="true" className={styles.caseIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <header className={styles.caseHeader}>
                  <h2>{project.title}</h2>
                  {project.domain ? <p>{project.domain}</p> : null}
                  <div className={styles.caseMeta}>
                    {formatYears(project.startYear, project.endYear) ? (
                      <span>{formatYears(project.startYear, project.endYear)}</span>
                    ) : null}
                    {project.role ? <span>{project.role}</span> : null}
                  </div>
                  {project.technologies?.length ? (
                    <ul className={styles.tags}>
                      {project.technologies.map((technology) => (
                        <li key={technology.id ?? technology.name}>
                          {technology.name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </header>
                <div className={styles.caseBody}>
                  {project.challenge ? (
                    <div>
                      <h3>业务问题</h3>
                      <p>{project.challenge}</p>
                    </div>
                  ) : null}
                  {project.decision ? (
                    <div>
                      <h3>技术决策</h3>
                      <p>{project.decision}</p>
                    </div>
                  ) : null}
                  {project.contributions?.length ? (
                    <div>
                      <h3>个人贡献</h3>
                      <ul className={styles.contributions}>
                        {project.contributions.map((contribution) => (
                          <li
                            key={
                              contribution.id ?? contribution.description
                            }
                          >
                            {contribution.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {publicProducts.length ? (
        <section className={styles.section}>
          <p className={styles.sectionLabel}>06 / 公开产品</p>
          <div className={styles.products}>
            {publicProducts.map((project) => {
              const cover = mediaFromRelationship(project.cover)
              const coverURL = cover?.sizes?.medium?.url ?? cover?.url

              return (
                <Link
                  className={styles.product}
                  href={`/projects/${project.slug}`}
                  key={project.id}
                >
                  {coverURL ? (
                    // Payload media URLs and dimensions are resolved at runtime.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={cover?.alt ?? project.title}
                      decoding="async"
                      loading="lazy"
                      src={coverURL}
                    />
                  ) : null}
                  <span className={styles.productCopy}>
                    <strong>{project.title}</strong>
                    {project.summary ? <span>{project.summary}</span> : null}
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {resume.governanceCases?.length || resume.skillGroups?.length ? (
        <section className={styles.governanceAndSkills}>
          {resume.governanceCases?.length ? (
            <div className={styles.governance}>
              <p className={styles.sectionLabel}>07 / 工程治理</p>
              {resume.governanceCases.map((item) => (
                <article className={styles.governanceCard} key={item.id ?? item.title}>
                  <h2>
                    {item.year ? `${item.year}｜` : ''}
                    {item.title}
                  </h2>
                  {item.summary ? <p>{item.summary}</p> : null}
                  {item.responsibilities?.length ? (
                    <ul className={styles.contributions}>
                      {item.responsibilities.map((responsibility) => (
                        <li
                          key={
                            responsibility.id ?? responsibility.description
                          }
                        >
                          {responsibility.description}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.focusAreas?.length ? (
                    <ul className={styles.tags}>
                      {item.focusAreas.map((area) => (
                        <li key={area.id ?? area.name}>{area.name}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {resume.skillGroups?.length ? (
            <div className={styles.skillGraph}>
              <p className={styles.sectionLabel}>08 / 技术能力图谱</p>
              <div className={styles.skillGrid}>
                {resume.skillGroups.map((group) => (
                  <section key={group.id ?? group.title}>
                    <h2>{group.title}</h2>
                    {group.skills?.length ? (
                      <p>{group.skills.map((skill) => skill.name).join('、')}</p>
                    ) : null}
                    {group.scenarios?.length ? (
                      <small>
                        场景：
                        {group.scenarios
                          .map((scenario) => scenario.name)
                          .join('、')}
                      </small>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {resume.currentFocus?.length ? (
        <section className={`${styles.section} ${styles.focus}`}>
          <p className={styles.sectionLabel}>09 / 当前关注方向</p>
          <ul>
            {resume.currentFocus.map((item) => (
              <li key={item.id ?? item.name}>
                <span>{item.name}</span>
                {item.status ? (
                  <small>
                    {item.status === 'active' ? '持续实践' : '探索中'}
                  </small>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {supplement ? (
        <section className={styles.section}>
          <p className={styles.sectionLabel}>补充内容</p>
          <div className={styles.supplement}>{supplement}</div>
        </section>
      ) : null}

      {email ? (
        <section className={`${styles.section} ${styles.contact}`}>
          <div>
            <p className={styles.sectionLabel}>10 / 联系</p>
            <h2>一起构建有价值的产品。</h2>
          </div>
          <a href={`mailto:${email}`}>发送邮件</a>
        </section>
      ) : null}
    </article>
  )
}
