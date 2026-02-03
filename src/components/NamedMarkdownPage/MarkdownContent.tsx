'use server'
import { Children, cloneElement } from 'react'

import parse from 'html-react-parser'
import Columns from '@/components/Columns'
import styles from './Menu.module.css'
import Link from 'next/link'
//import { MarkdownError } from './MarkdownError'

interface MarkdownContentProps {
  html: string
  autoMenu?: boolean
  afterLinks?: Array<{ url: string; name: string }> | null
}

interface MarkdownComponentProps {
  html: string
  className?: string
  [key: string]: any
}

interface ContentProps {
  html: string
  afterLinks?: Array<{ url: string; name: string }> | null
}

interface AfterlinksProps {
  data: Array<{ url: string; name: string }>
}

export const MarkdownContent = async ({
  html,
  autoMenu,
  afterLinks = null
}: MarkdownContentProps) => {
  const ContentComponent = autoMenu ? MarkdownContentWithMenu : MarkdownContentNoMenu
  return <ContentComponent html={html} afterLinks={afterLinks} />
}

const linkify = (text: string): string => {
  const lower = text.toLowerCase()
  const arr = lower.split(' ')
  return arr.join('_')
}

export const MarkdownComponent = async ({ html, ...props }: MarkdownComponentProps) => {
  const { className = '', ...rest } = props

  return (
    <div
      className={`${styles.content} ${styles.solo} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  )
}

export const MarkdownContentNoMenu = async ({ html, afterLinks }: ContentProps) => (
  <>
    <section
      className={`${styles.content} ${styles.solo}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
    {afterLinks && <Afterlinks data={afterLinks} />}
  </>
)

export const MarkdownContentWithMenu = async ({ html, afterLinks }: ContentProps) => {
  const nodes = parse(html)
  const menu: string[] = []
  const arrayChildren = Children.toArray(nodes)
  const modifiedNodes = Children.map(arrayChildren, child => {
    if ((child as any).type === 'h2') {
      const text = (child as any).props.children
      menu.push(text)
      return cloneElement(child as any, {
        id: linkify(text)
      })
    }
    return child
  })

  if (menu.length < 1) {
    return <MarkdownContentNoMenu html={html} afterLinks={afterLinks} />
  }

  return (
    <section>
      <Columns layout='42'>
        <div className={styles.content}>
          {modifiedNodes}
          {afterLinks && <Afterlinks data={afterLinks} />}
        </div>
        <div>
          <h2 className={`${styles.onthispage} ${styles.onthispageBold}`}>On this page</h2>
          <ol className={styles.menu}>
            {menu.map((item, i) => (
              <li key={i}>
                <a href={'#' + linkify(item)}>{item}</a>
              </li>
            ))}
          </ol>
        </div>
      </Columns>
    </section>
  )
}

const Afterlinks = ({ data }: AfterlinksProps) => (
  <>
    <hr />
    <ul>
      {data.map(item => (
        <li key={item.url}>
          <Link href={item.url}>{item.name}</Link>
        </li>
      ))}
    </ul>
  </>
)
