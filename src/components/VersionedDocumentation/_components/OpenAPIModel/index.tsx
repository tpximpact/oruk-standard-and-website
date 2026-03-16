'use client'
import dynamic from 'next/dynamic'
const JSONLiteral = dynamic(() => import('../JSONLiteral'))

import styles from './OpenAPIModel.module.css'
import { ContentHTML } from '@/components/ContentHTML'

interface OpenAPIModelProps {
  allVersionsContent: string
  data: {
    htmlContent: string
    rootSpec: {
      parsed: Record<string, unknown>
    }
  }
}

export const OpenAPIModel = ({ allVersionsContent, data }: OpenAPIModelProps) => (
  <>
    <div className={styles.allVersionsContent}>
      <ContentHTML html={allVersionsContent} />
    </div>
    <div className={styles.thisVersionContent}>
      <ContentHTML html={data.htmlContent} />
    </div>

    <JSONLiteral data={data.rootSpec.parsed} />
  </>
)
