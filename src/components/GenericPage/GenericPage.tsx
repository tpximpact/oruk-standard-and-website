import { NamedMarkdownPage } from '@/components/NamedMarkdownPage'
import { PageList } from '@/components/PageList'
import { PageMargin } from '@/components/PageMargin'
import { notFound } from 'next/navigation'
import { getNamedSiteItem } from '@/utilities/getNamedSiteItem'
import { formatNodesForPageMenu } from '@/utilities/formatNodesForPageMenu'
import { Metadata } from 'next'

export const metadata = (name: string): Metadata => {
  const pageData = getNamedSiteItem(name)
  const title =
    pageData && typeof pageData.label === 'string'
      ? pageData.label
      : String(pageData?.label ?? 'Open Referral UK')
  return {
    title
  }
}

interface GenericPageProps {
  name: string
}

export const GenericPage = ({ name }: GenericPageProps) => {
  const pageData = getNamedSiteItem(name)
  if (!pageData) return notFound()
  const childNodes = pageData.childNodes
  let menuNodes
  if (childNodes) {
    const siteItems = childNodes
      .map(node => (typeof node === 'string' ? getNamedSiteItem(node) : node))
      .filter((node): node is NonNullable<typeof node> => node !== undefined)
    menuNodes = formatNodesForPageMenu(siteItems as any)
  }

  return (
    <>
      <NamedMarkdownPage name={name} autoMenu={pageData.autoMenu} />
      {menuNodes && menuNodes.length > 0 && (
        <PageMargin>
          <PageList data={menuNodes} />
        </PageMargin>
      )}
    </>
  )
}
