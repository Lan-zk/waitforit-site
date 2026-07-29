import { render, screen } from '@testing-library/react'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'

import { describe, expect, it } from 'vitest'

const sourcePath = 'content/blog/test-post/index.md'

describe('MarkdownRenderer', () => {
  it('renders GFM, heading anchors, code, and scrollable tables', () => {
    const { container } = render(
      <MarkdownRenderer
        markdown={`## Rendering table

~~removed~~

- [x] complete

| Feature | Result |
| --- | --- |
| GFM | works |

\`\`\`ts
const ready = true
\`\`\`
`}
        sourcePath={sourcePath}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Rendering table' }),
    ).toHaveAttribute('id', 'user-content-rendering-table')
    expect(container.querySelector('del')).toHaveTextContent('removed')
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('table').parentElement).toHaveAttribute(
      'data-table-scroll',
    )
    expect(container.querySelector('pre code')).toHaveTextContent(
      'const ready = true',
    )
  })

  it('drops raw HTML and does not execute article JavaScript', () => {
    const { container } = render(
      <MarkdownRenderer
        markdown={`Before

<script>window.compromised = true</script>
<img src=x onerror="window.compromised = true">

After`}
        sourcePath={sourcePath}
      />,
    )

    expect(container.querySelector('script')).not.toBeInTheDocument()
    expect(container.querySelector('[onerror]')).not.toBeInTheDocument()
    expect(container.innerHTML).not.toContain('window.compromised')
  })

  it('opens external links safely and keeps internal links in the same tab', () => {
    render(
      <MarkdownRenderer
        markdown="[External](https://example.com) and [internal](/novel)"
        sourcePath={sourcePath}
      />,
    )

    expect(screen.getByRole('link', { name: /External/ })).toMatchObject({
      rel: 'noopener noreferrer',
      target: '_blank',
    })
    expect(screen.getByRole('link', { name: 'internal' })).not.toHaveAttribute(
      'target',
    )
  })

  it('rewrites relative images through the controlled content route', () => {
    render(
      <MarkdownRenderer
        markdown="![Publishing flow](./assets/cover.svg)"
        sourcePath={sourcePath}
      />,
    )

    expect(screen.getByRole('img', { name: 'Publishing flow' })).toHaveAttribute(
      'src',
      '/content-assets/blog/test-post/assets/cover.svg',
    )
  })

  it('removes only a duplicate leading document title', () => {
    render(
      <MarkdownRenderer
        documentTitle="Document title"
        markdown={'# Document title\n\n## First section'}
        sourcePath={sourcePath}
      />,
    )

    expect(
      screen.queryByRole('heading', { name: 'Document title' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'First section' }),
    ).toBeInTheDocument()
  })
})
