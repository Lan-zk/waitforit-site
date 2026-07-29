import { render, screen } from '@testing-library/react'

import {
  hasMeaningfulRichText,
  isSerializedEditorState,
  RichTextRenderer,
} from '@/components/RichTextRenderer'
import type { Resume } from '@/payload-types'

import { describe, expect, it } from 'vitest'

const richText: NonNullable<Resume['content']> = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '工作经历',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h2',
        type: 'heading',
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 1,
            mode: 'normal',
            style: '',
            text: '构建长期可维护的个人站。',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

const emptyRichText: NonNullable<Resume['content']> = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

describe('RichTextRenderer', () => {
  it('renders the existing Resume Lexical content with official converters', () => {
    const { container } = render(<RichTextRenderer data={richText} />)

    expect(
      screen.getByRole('heading', { level: 2, name: '工作经历' }),
    ).toBeVisible()
    expect(screen.getByText('构建长期可维护的个人站。')).toBeVisible()
    expect(container.querySelector('strong')).toHaveTextContent(
      '构建长期可维护的个人站。',
    )
  })

  it('does not render an empty editor paragraph', () => {
    const { container } = render(<RichTextRenderer data={emptyRichText} />)

    expect(hasMeaningfulRichText(emptyRichText)).toBe(false)
    expect(container).toBeEmptyDOMElement()
  })

  it('rejects malformed editor data', () => {
    expect(isSerializedEditorState({ root: { children: [] } })).toBe(false)
    expect(hasMeaningfulRichText(null)).toBe(false)
  })
})
