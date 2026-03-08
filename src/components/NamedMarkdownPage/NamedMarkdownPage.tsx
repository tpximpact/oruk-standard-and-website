import { getNamedSiteItem } from '@/utilities/getNamedSiteItem'
import { readFile } from '@/utilities/readFile'
import { MarkdownPage } from './MarkdownPage'
import { PageMargin } from '@/components/PageMargin'
import { parseMarkdown } from '@/utilities/parseMarkdown'

interface NamedMarkdownPageProps {
  name: string
  noMargin?: boolean
  markdownRaw?: string | null
  [key: string]: unknown
}

export const NamedMarkdownPage = ({
  name,
  noMargin,
  markdownRaw,
  ...props
}: NamedMarkdownPageProps) => {
  if (!markdownRaw) {
    const pageData = getNamedSiteItem(name)
    markdownRaw =
      pageData && pageData.contentPath
        ? readFile({
            folder: pageData.contentPath
          })
        : null
  }
  const parsed = parseMarkdown(markdownRaw ?? '')
  const html = parsed ? parsed.content : undefined
  if (noMargin) return <MarkdownPage file={name} html={html} {...props} />
  return (
    <PageMargin>
      <MarkdownPage file={name} html={html} {...props} />
    </PageMargin>
  )
}
