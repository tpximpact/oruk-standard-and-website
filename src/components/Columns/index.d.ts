import { ReactNode } from 'react'

interface ColumnsProps {
  className?: string
  children: ReactNode
  layout?: string | number
  debug?: boolean
  supressTrailingSpace?: boolean
  [key: string]: unknown
}

declare const Columns: React.FC<ColumnsProps>

export default Columns
