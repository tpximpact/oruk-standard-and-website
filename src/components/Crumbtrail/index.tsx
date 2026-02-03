'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './Crumbtrail.module.css'
import { getPageByPath } from '@/utilities/getPageByPath'
import { PageMargin } from '@/components/PageMargin'

interface Crumb {
  label: string
  urlPath: string
}

export const generateCrumbs = (path: string): Crumb[] => {
  if (!path) return []
  const fragments = path.split('/')
  const crumbs = fragments
    .map((_element, index) => {
      const rebuiltPath = fragments.slice(0, index + 1).join('/')
      const match = getPageByPath(rebuiltPath)
      let label = match ? match.label : ''

      return {
        label: label,
        urlPath: rebuiltPath
      }
    })
    .slice(1)
  return crumbs
}

export const Crumbtrail = () => {
  const path = usePathname()
  if (path === '/') return <Empty />
  return <Crumbs data={generateCrumbs(path)} />
}

export const Empty = () => <div className={styles.emptySpace}></div>

interface CrumbsProps {
  data: Crumb[]
}

export const Crumbs = ({ data }: CrumbsProps) => (
  <PageMargin>
    <nav className={styles.crumbtrail}>
      <ol>
        <NavigationItem urlPath='/' label='Home' />
        {data.map((c, i) => i < data.length - 1 && <NavigationItem key={i} {...c} />)}
      </ol>
    </nav>
  </PageMargin>
)

interface NavigationItemProps {
  urlPath: string
  label: string
}

const NavigationItem = ({ urlPath, label }: NavigationItemProps) => {
  const lastSegment = urlPath.split('/')[urlPath.split('/').length - 1] || ''
  return (
    <li>
      <Link href={urlPath}>
        {label.length > 0 ? label : titlecase(lastSegment).replace('-', ' ')}
      </Link>
    </li>
  )
}

const titlecase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
}
