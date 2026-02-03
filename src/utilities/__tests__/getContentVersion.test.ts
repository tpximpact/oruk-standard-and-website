import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getContentVersion } from '../getContentVersion'
import { read } from '../read'
import { parseMarkdown } from '../parseMarkdown'

vi.mock('../read')
vi.mock('../parseMarkdown')
vi.mock('../getAllFilesInFolderWithExtension', () => ({
  getAllFilesInFolderWithExtension: vi.fn(() => [])
}))

describe('getContentVersion', () => {
  const mockRead = vi.mocked(read)
  const mockParseMarkdown = vi.mocked(parseMarkdown)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load content version with markdown and spec', () => {
    const markdownContent = '# Test Content'
    const specContent = { paths: {}, info: { title: 'Test API' } }

    mockRead.mockImplementation((path: string) => {
      if (path.includes('.md')) return markdownContent
      if (path.includes('.json')) return JSON.stringify(specContent)
      return ''
    })

    mockParseMarkdown.mockReturnValue({
      content: '<h1>Test Content</h1>',
      frontmatter: { title: 'Test' }
    })

    const result = getContentVersion({
      contentFolder: 'content',
      specificationFolderPath: 'spec/1.0'
    })

    expect(result).toBeDefined()
    expect(result.rootSpec.parsed).toEqual(specContent)
    expect(mockParseMarkdown).toHaveBeenCalledWith(markdownContent)
  })

  it('should handle parseMarkdown returning null', () => {
    const specContent = { paths: {} }

    mockRead.mockImplementation((path: string) => {
      if (path.includes('.md')) return ''
      if (path.includes('.json')) return JSON.stringify(specContent)
      return ''
    })

    mockParseMarkdown.mockReturnValue(null)

    const result = getContentVersion({
      contentFolder: 'content',
      specificationFolderPath: 'spec/1.0'
    })

    expect(result.htmlContent).toBe('')
  })

  it('should parse spec JSON correctly', () => {
    const specContent = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: { '/test': { get: { summary: 'Test endpoint' } } }
    }

    mockRead.mockImplementation((path: string) => {
      if (path.includes('.md')) return '# Test'
      if (path.includes('.json')) return JSON.stringify(specContent)
      return ''
    })

    mockParseMarkdown.mockReturnValue({
      content: '<h1>Test</h1>',
      frontmatter: {}
    })

    const result = getContentVersion({
      contentFolder: 'content',
      specificationFolderPath: 'spec/1.0'
    })

    expect(result.rootSpec.parsed).toEqual(specContent)
    expect(result.rootSpec.parsed.openapi).toBe('3.0.0')
    expect(result.rootSpec.parsed.paths['/test']).toBeDefined()
  })

  it('should process schemata if present in spec', () => {
    const specContent = {
      paths: {},
      components: {
        schemas: {
          TestSchema: {
            type: 'object',
            properties: { id: { type: 'string' } }
          }
        }
      }
    }

    mockRead.mockImplementation((path: string) => {
      if (path.includes('.md')) return '# Test'
      if (path.includes('.json')) return JSON.stringify(specContent)
      return ''
    })

    mockParseMarkdown.mockReturnValue({
      content: '<h1>Test</h1>',
      frontmatter: {}
    })

    const result = getContentVersion({
      contentFolder: 'content',
      specificationFolderPath: 'spec/1.0'
    })

    expect(result.rootSpec.parsed.components?.schemas).toBeDefined()
    expect(result.rootSpec.parsed.components?.schemas?.TestSchema).toBeDefined()
  })
})
