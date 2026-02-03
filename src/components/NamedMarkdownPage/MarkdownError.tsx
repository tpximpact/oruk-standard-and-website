'use server'

import { getNamedSiteItem } from '@/utilities/getNamedSiteItem'
import styles from './MarkdownError.module.css'

interface MarkdownErrorProps {
  file: string
}

export const MarkdownError = async ({ file }: MarkdownErrorProps) => {
  const pageData = getNamedSiteItem(file)
  return (
    <div>
      Sorry, the requested content file <span className={styles.italicText}>{file}</span> (
      {pageData?.name}) could not be read
    </div>
  )
}
