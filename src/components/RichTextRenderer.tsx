import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'

import type { Resume } from '@/payload-types'

import styles from './MarkdownRenderer.module.css'

type LexicalNode = {
  children?: unknown
  text?: unknown
  type?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isSerializedEditorState(
  value: unknown,
): value is SerializedEditorState {
  if (!isRecord(value) || !isRecord(value.root)) return false

  const { children, type, version } = value.root
  return type === 'root' && Array.isArray(children) && typeof version === 'number'
}

function nodeHasMeaningfulContent(value: unknown): boolean {
  if (!isRecord(value)) return false

  const node = value as LexicalNode
  if (typeof node.text === 'string' && node.text.trim().length > 0) return true

  if (
    typeof node.type === 'string' &&
    ['block', 'horizontalrule', 'inlineBlock', 'table', 'upload'].includes(
      node.type,
    )
  ) {
    return true
  }

  return (
    Array.isArray(node.children) &&
    node.children.some((child) => nodeHasMeaningfulContent(child))
  )
}

export function hasMeaningfulRichText(
  data: Resume['content'] | null | undefined,
) {
  return (
    isSerializedEditorState(data) &&
    data.root.children.some((child) => nodeHasMeaningfulContent(child))
  )
}

type RichTextRendererProps = {
  className?: string
  data: Resume['content'] | null | undefined
}

export function RichTextRenderer({
  className,
  data,
}: RichTextRendererProps) {
  if (!hasMeaningfulRichText(data) || !isSerializedEditorState(data)) {
    return null
  }

  return (
    <RichText
      className={[styles.markdown, className].filter(Boolean).join(' ')}
      data={data}
    />
  )
}
