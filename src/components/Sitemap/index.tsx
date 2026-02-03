import styles from './Sitemap.module.css'
import Link from 'next/link'
import { PageList } from '@/components/PageList'
import { PageMargin } from '@/components/PageMargin'
import { listDynamicSection } from '@/utilities/dynamicSection'
import { ReactNode } from 'react'

interface ChildNode {
  label: string
  urlPath?: string
  offsite?: boolean
  teaser?: string
  dynamic?: boolean
}

interface SitemapNode {
  label: string
  urlPath?: string
  childNodes?: ChildNode[]
}

interface SitemapProps {
  showHeading?: boolean
  data: SitemapNode[]
}

export const Sitemap = ({ showHeading = true, data }: SitemapProps) => (
  <PageMargin>
    {showHeading && <h1 className={styles.heading}>All pages on ORUK</h1>}
    <List data={data}>
      <li>
        <Link href={'/'}>Home</Link>
      </li>
    </List>
  </PageMargin>
)

interface ListProps {
  data: SitemapNode[]
  children: ReactNode
}

const List = ({ data, children }: ListProps) => (
  <ol className={styles.list}>
    {children}
    {data.map((node, i) => {
      return <Node data={node} key={i} />
    })}
  </ol>
)

interface NodeProps {
  data: SitemapNode
}

const Node = ({ data }: NodeProps) => {
  if (!data.urlPath) return null

  const menuItems = data.childNodes
    ? data.childNodes.flatMap(node =>
        node.dynamic
          ? listDynamicSection({
              rootContentFolder: data.urlPath!
            })
          : [
              {
                title: node.label,
                path: node.urlPath || '',
                offsite: node.offsite,
                slug: node.teaser || ''
              }
            ]
      )
    : listDynamicSection({
        rootContentFolder: data.urlPath
      })
  return (
    <li>
      <Link href={data.urlPath}>{data.label}</Link>

      <PageList suppressDetails={true} data={menuItems} />
    </li>
  )
}
