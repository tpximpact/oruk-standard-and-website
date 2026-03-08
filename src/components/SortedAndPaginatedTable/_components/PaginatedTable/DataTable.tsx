import Link from 'next/link'
import Icon, { ICON_TYPE, ICON_TYPE_DATA } from '@/components/Icon'
import { STATUS } from '@/utilities/status'
import { getColourForStatus } from '@/utilities/getColourForStatus'
import { getIconForStatus } from '@/utilities/getIconForStatus'
import { formatDate } from './formatDate'
import styles from './DataTable.module.css'
import { HTMLAttributes, ReactNode } from 'react'

export interface Header {
  label: string
  dataType: string
}

interface DataTableProps {
  columns: string[]
  headers: Record<string, Header>
  rows: Array<Record<string, unknown>>
}

interface CellPayload {
  value?: unknown
  url?: string
}

interface CellContentProps {
  dataType?: string
  label?: string
  payload: unknown
}

export const DataTable = ({ columns, headers, rows }: DataTableProps) => (
  <Table>
    <Thead>
      <Tr>
        {columns.map(col => {
          const dataType = headers[col]?.dataType
          const header = headers[col]
          return (
            <Th className={getCellClassFordataType(dataType)} key={col}>
              {header?.label}
            </Th>
          )
        })}
      </Tr>
    </Thead>

    <Tbody>
      {rows.map((row, i) => (
        <Tr key={i}>
          {columns.map((column, j) => {
            const dataType = headers[column]?.dataType
            const Component = j === 0 ? Th : Td
            const cellProps = j === 0 ? { column: 'false' } : {}
            return (
              <Component key={j} className={getCellClassFordataType(dataType)} {...cellProps}>
                <CellContent
                  dataType={dataType}
                  label={headers[column]?.label}
                  payload={row[column]}
                />
              </Component>
            )
          })}
        </Tr>
      ))}
    </Tbody>
  </Table>
)

const Table = ({
  children,
  className = '',
  ...props
}: {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div role='table' className={`${styles.table} ${className}`} {...props}>
    {children}
  </div>
)
const Thead = ({
  children,
  className = '',
  ...props
}: {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div role='rowgroup' className={`${styles.thead} ${className}`} {...props}>
    {children}
  </div>
)
const Tbody = ({
  children,
  className = '',
  ...props
}: {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div role='rowgroup' className={`${styles.tbody} ${className}`} {...props}>
    {children}
  </div>
)
const Tr = ({
  children,
  className = '',
  ...props
}: {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div role='row' className={`${styles.tr} ${className}`} {...props}>
    {children}
  </div>
)
const Th = ({
  children,
  className = '',
  column,
  ...props
}: {
  children: ReactNode
  className?: string
  column?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    role={column ? 'columnheader' : 'rowheader'}
    className={`${styles.th} ${className}`}
    {...props}
  >
    {children}
  </div>
)
const Td = ({
  children,
  className = '',
  ...props
}: {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLDivElement>) => (
  <div role='cell' className={`${styles.td} ${className}`} {...props}>
    {children}
  </div>
)

const getCellClassFordataType = (dataType?: string): string | undefined => {
  if (!dataType) return undefined
  switch (dataType) {
    case 'oruk:dataType.string':
      return styles.string
    case 'oruk:dataType.numeric':
      return styles.numeric
    case 'oruk:dataType.success':
      return undefined
    case 'oruk:dataType.dateTime':
      return styles.date
    case 'oruk:dataType.markdown':
      return styles.markdown || ''
    default:
      return ''
  }
}

const DisplayDate = ({ d }: { d: string }) => <span suppressHydrationWarning>{formatDate(d)}</span>

const truncate = (str: string, numWords: number): string => {
  let truncated = str.split(' ').splice(0, numWords).join(' ')
  if (truncated.length < str.length) {
    truncated = truncated + '…'
  }
  return truncated
}

const MAX_TEXT_LENGTH_WORDCOUNT = 20

const CellContent = ({ dataType, label, payload }: CellContentProps) => {
  // Handle case where payload might not be an object
  if (!payload || typeof payload !== 'object') {
    return (
      <>
        <span className={styles.label}>{label}</span>
        <span>{String(payload || '')}</span>
      </>
    )
  }

  const typedPayload = payload as CellPayload
  let val = typedPayload.value
  const target = typedPayload.url

  // if the payload doesnt have a value
  // but does have a url, use that as the value
  if (val === undefined && target) {
    val = target
  }

  let result
  switch (dataType) {
    case 'oruk:dataType.markdown':
      result = (
        <span className={styles.markdown}>
          {truncate(String(val || ''), MAX_TEXT_LENGTH_WORDCOUNT)}
        </span>
      )
      break
    case 'oruk:dataType.string':
      result = String(val || '')
      break
    case 'oruk:dataType.numeric':
      result = String(val || '')
      break
    case 'oruk:dataType.success':
      result = <StatusReadout pass={Boolean(val)} />
      break
    case 'oruk:dataType.dateTime':
      result = <DisplayDate d={String(val || '')} />
      break
    default:
      result = String(val || '')
      break
  }

  const str = (
    <>
      <span className={styles.label}>{label}</span>
      <span>{typeof result === 'string' && result.startsWith('http') ? '[view]' : result}</span>
    </>
  )

  if (target) {
    const offsite = target.startsWith('http')
    if (offsite) {
      return (
        <a
          href={target}
          className={offsite ? styles.offsiteLink : undefined}
          target={offsite ? '_blank' : '_self'}
        >
          {str}
          {offsite ? <OffsiteIcon /> : null}
        </a>
      )
    } else {
      return <Link href={target}>{str}</Link>
    }
  } else {
    return str
  }
}

const OffsiteIcon = () => (
  <span style={{ marginLeft: '0.2rem' }}>
    <Icon weight={2} icon={ICON_TYPE_DATA[ICON_TYPE.NEWWINDOW]} size={18} />
  </span>
)

const StatusReadout = ({ pass }: { pass: boolean | number }) => {
  const status = pass ? STATUS.PASS : STATUS.FAIL
  return (
    <>
      <span style={{ marginRight: '0.2rem' }}>
        <Icon
          colour={getColourForStatus(status)}
          weight={4}
          icon={getIconForStatus(status)}
          size={18}
        />
      </span>
      {status}
    </>
  )
}
