export const MarkdownContent = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
)
