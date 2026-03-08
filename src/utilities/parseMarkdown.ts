import { marked } from 'marked'
import matter from 'gray-matter'

interface ParsedMarkdown {
  content: string
  frontmatter: Record<string, unknown>
}

export const parseMarkdown = (fileContents: string): ParsedMarkdown | null => {
  const parsed = matter(fileContents)
  const hasContent = parsed.content.trim().length > 0
  const hasFrontmatter = Object.keys(parsed.data).length > 0

  if (hasContent || hasFrontmatter) {
    const content = marked.parse(parsed.content) as string
    const frontmatter = parsed.data
    return {
      content: content,
      frontmatter: frontmatter
    }
  }
  return null
}
