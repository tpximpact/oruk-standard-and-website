import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseMarkdown } from '../parseMarkdown'

vi.mock('gray-matter', () => ({
  default: vi.fn()
}))
vi.mock('marked', () => ({
  marked: {
    parse: vi.fn()
  }
}))

describe('parseMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse markdown with frontmatter', async () => {
    const matter = (await import('gray-matter')).default
    const { marked } = await import('marked')

    const markdown = `---
title: Test Page
slug: test-page
modified: '2026-01-01T00:00:00.000Z'
---

# Hello World

This is a test.`

    const mockParsed = {
      content: '# Hello World\n\nThis is a test.',
      data: {
        title: 'Test Page',
        slug: 'test-page',
        modified: '2026-01-01T00:00:00.000Z'
      },
      isEmpty: false
    }

    vi.mocked(matter).mockReturnValue(mockParsed as any)
    vi.mocked(marked.parse).mockReturnValue('<h1>Hello World</h1>\n<p>This is a test.</p>')

    const result = parseMarkdown(markdown)

    expect(result).not.toBeNull()
    expect(result?.frontmatter).toEqual({
      title: 'Test Page',
      slug: 'test-page',
      modified: '2026-01-01T00:00:00.000Z'
    })
    expect(result?.content).toContain('<h1>Hello World</h1>')
    expect(result?.content).toContain('<p>This is a test.</p>')
  })

  it('should handle markdown without frontmatter', async () => {
    const matter = (await import('gray-matter')).default
    const { marked } = await import('marked')

    const markdown = '# Content Only\n\nNo frontmatter here.'

    const mockParsed = {
      content: '# Content Only\n\nNo frontmatter here.',
      data: {},
      isEmpty: false
    }

    vi.mocked(matter).mockReturnValue(mockParsed as any)
    vi.mocked(marked.parse).mockReturnValue('<h1>Content Only</h1>\n<p>No frontmatter here.</p>')

    const result = parseMarkdown(markdown)

    expect(result).not.toBeNull()
    expect(result?.frontmatter).toEqual({})
    expect(result?.content).toContain('<h1>Content Only</h1>')
  })

  it('should return null for empty content', async () => {
    const matter = (await import('gray-matter')).default

    const markdown = ''

    const mockParsed = {
      content: '',
      data: {},
      isEmpty: true
    }

    vi.mocked(matter).mockReturnValue(mockParsed as any)

    const result = parseMarkdown(markdown)

    expect(result).toBeNull()
  })

  it('should parse markdown with links', async () => {
    const matter = (await import('gray-matter')).default
    const { marked } = await import('marked')

    const markdown = '[Link text](https://example.com)'

    const mockParsed = {
      content: '[Link text](https://example.com)',
      data: {},
      isEmpty: false
    }

    vi.mocked(matter).mockReturnValue(mockParsed as any)
    vi.mocked(marked.parse).mockReturnValue('<p><a href="https://example.com">Link text</a></p>')

    const result = parseMarkdown(markdown)

    expect(result).not.toBeNull()
    expect(result?.content).toContain('<a href="https://example.com">Link text</a>')
  })

  it('should parse markdown with code blocks', async () => {
    const matter = (await import('gray-matter')).default
    const { marked } = await import('marked')

    const markdown = '```javascript\nconst x = 1;\n```'

    const mockParsed = {
      content: '```javascript\nconst x = 1;\n```',
      data: {},
      isEmpty: false
    }

    vi.mocked(matter).mockReturnValue(mockParsed as any)
    vi.mocked(marked.parse).mockReturnValue(
      '<pre><code class="language-javascript">const x = 1;\n</code></pre>'
    )

    const result = parseMarkdown(markdown)

    expect(result).not.toBeNull()
    expect(result?.content).toContain('<code class="language-javascript">')
  })

  it('should parse markdown with bold and italic', async () => {
    const matter = (await import('gray-matter')).default
    const { marked } = await import('marked')

    const markdown = '**Bold** and *italic*'

    const mockParsed = {
      content: '**Bold** and *italic*',
      data: {},
      isEmpty: false
    }

    vi.mocked(matter).mockReturnValue(mockParsed as any)
    vi.mocked(marked.parse).mockReturnValue('<p><strong>Bold</strong> and <em>italic</em></p>')

    const result = parseMarkdown(markdown)

    expect(result).not.toBeNull()
    expect(result?.content).toContain('<strong>Bold</strong>')
    expect(result?.content).toContain('<em>italic</em>')
  })

  it('should handle complex frontmatter', async () => {
    const matter = (await import('gray-matter')).default
    const { marked } = await import('marked')

    const markdown = `---
title: Complex Page
tags:
  - tag1
  - tag2
nested:
  key: value
---

Content here`

    const mockParsed = {
      content: 'Content here',
      data: {
        title: 'Complex Page',
        tags: ['tag1', 'tag2'],
        nested: { key: 'value' }
      },
      isEmpty: false
    }

    vi.mocked(matter).mockReturnValue(mockParsed as any)
    vi.mocked(marked.parse).mockReturnValue('<p>Content here</p>')

    const result = parseMarkdown(markdown)

    expect(result).not.toBeNull()
    expect(result?.frontmatter.tags).toEqual(['tag1', 'tag2'])
    expect(result?.frontmatter.nested).toEqual({ key: 'value' })
  })
})
