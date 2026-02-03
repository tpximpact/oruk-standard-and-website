import styles from './Dashboard.module.css'
import Link from 'next/link'
import Icon from '@/components/Icon'
import { STATUS } from '@/utilities/status'
import { getColourForStatus } from '@/utilities/getColourForStatus'
import { getIconForStatus } from '@/utilities/getIconForStatus'

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    year: '2-digit',
    month: '2-digit',
    day: 'numeric'
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

interface TableProps {
  headers: any[]
  data: any[]
}

export const Table = ({ headers, data }: TableProps) => (
  <table className={styles.table}>
    <thead>
      <tr>
        {headers.map((header: any, idx: number) => (
          <th key={idx}>{header}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row: any, idx: number) => (
        <Row key={idx} data={row} />
      ))}
    </tbody>
  </table>
)

interface StatusReadoutProps {
  pass: boolean
}

const StatusReadout = ({ pass }: StatusReadoutProps) => {
  const status = pass ? STATUS.PASS : STATUS.FAIL
  return (
    <>
      <span className={styles.iconMargin}>
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

interface RowProps {
  data: any
}

const Row = ({ data }: RowProps) => {
  const detailsURL = `/developer/tools/dashboard/${data.id}`
  return (
    <tr>
      <th>{data.label}</th>
      <td>1.0</td>
      <td>
        <StatusReadout pass={data.isUp} />
      </td>
      <td>
        <StatusReadout pass={data.isServicesValid} />
      </td>
      <td>
        <StatusReadout pass={data.isSearchEnabled} />
      </td>
      <td>{formatDate(data.lastCheck)}</td>

      <td>
        <Link href={detailsURL}>details</Link>
      </td>
    </tr>
  )
}
