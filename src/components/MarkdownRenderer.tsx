import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

import { resolveMarkdownAssetSource } from '@/content/paths'

import styles from './MarkdownRenderer.module.css'
import { ReadingScrollReveal } from './ReadingScrollReveal'

interface MarkdownRendererProps {
  documentTitle?: string
  externalLinkLabel?: string
  markdown: string
  revealOnScroll?: boolean
  sourcePath: string
}

function MarkdownLink({
  children,
  externalLinkLabel,
  href,
  ...props
}: ComponentPropsWithoutRef<'a'> & { externalLinkLabel?: string }) {
  const external = Boolean(href && /^https?:\/\//i.test(href))
  return (
    <a
      {...props}
      href={href}
      rel={external ? 'noopener noreferrer' : undefined}
      target={external ? '_blank' : undefined}
    >
      {children}
      {external ? (
        <span aria-hidden="true" className={styles.externalMark}>
          ↗
        </span>
      ) : null}
      {external && externalLinkLabel ? (
        <span className={styles.srOnly}>{externalLinkLabel}</span>
      ) : null}
    </a>
  )
}

export function MarkdownRenderer({
  documentTitle,
  externalLinkLabel,
  markdown,
  revealOnScroll = false,
  sourcePath,
}: MarkdownRendererProps) {
  const renderedMarkdown = documentTitle
    ? removeDuplicateLeadingTitle(markdown, documentTitle)
    : markdown

  const content = (
    <ReactMarkdown
      components={{
        a: (props) => (
          <MarkdownLink
            {...props}
            externalLinkLabel={externalLinkLabel}
          />
        ),
        img: ({ alt, src, ...props }) => {
          if (typeof src !== 'string' || !src) return null
          const resolved = resolveMarkdownAssetSource(sourcePath, src)
          if (!resolved) return null
          return (
            // Content dimensions are author-controlled and not known at build time.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...props}
              alt={alt ?? ''}
              decoding="async"
              loading="lazy"
              src={resolved}
            />
          )
        },
        table: ({ children, ...props }) => (
          <div className={styles.tableScroll} data-table-scroll>
            <table {...props}>{children}</table>
          </div>
        ),
      }}
      rehypePlugins={[rehypeSlug, rehypeSanitize]}
      remarkPlugins={[remarkGfm]}
      skipHtml
    >
      {renderedMarkdown}
    </ReactMarkdown>
  )

  return revealOnScroll ? (
    <ReadingScrollReveal className={styles.markdown}>
      {content}
    </ReadingScrollReveal>
  ) : (
    <div className={styles.markdown}>
      {content}
    </div>
  )
}

function removeDuplicateLeadingTitle(markdown: string, documentTitle: string) {
  const match = /^\s*#\s+([^\r\n]+)(?:\r?\n|$)/.exec(markdown)
  if (!match || match[1].trim() !== documentTitle.trim()) return markdown
  return markdown.slice(match[0].length).trimStart()
}
