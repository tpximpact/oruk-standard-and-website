import styles from './Timeline.module.css'
import interpolate from 'color-interpolate'
import { parseMarkdown } from '@/utilities/parseMarkdown'

const colormap = interpolate(['orange', 'red', 'purple'])

interface ContentData {
  content: string
  hide?: boolean
}

interface TimelineRow {
  tranche: ContentData
  deliverable: ContentData
  tasks: ContentData
  effort: ContentData
  months: number[]
}

interface TimelineProps {
  rows: TimelineRow[]
}

export const Timeline = ({ rows }: TimelineProps) => (
  <div className='scrollingTableWrapper'>
    <table className={styles.gantt}>
      <thead>
        <tr>
          <th colSpan={4}>Version: 1.0</th>
          <th className={styles.month} colSpan={12}>
            Month
          </th>
        </tr>
        <tr>
          <th className={styles.tranche}>Tranche</th>
          <th className={styles.deliverable}>Deliverable</th>
          <th className={styles.tasks}>Tasks</th>
          <th className={styles.effort}>Expected effort</th>
          {[...Array(12).keys()].map(n => (
            <th key={n} className={styles.month}>
              {n + 1}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <Row key={i} {...r} />
        ))}
      </tbody>
    </table>
  </div>
)

const Row = ({ tranche, deliverable, tasks, effort, months }: TimelineRow) => (
  <tr>
    <th className={styles.tranche}>
      <Content {...tranche} />
    </th>
    <td className={styles.deliverable}>
      <Content {...deliverable} />
    </td>
    <td className={styles.tasks}>
      <Content {...tasks} />
    </td>
    <td className={styles.effort}>
      <Content {...effort} />
    </td>
    {[...Array(12).keys()].map(n => (
      <Month key={n} number={n} shaded={months.includes(n + 1)} colour={colormap((1.0 / 12) * n)} />
    ))}
  </tr>
)

interface MonthProps {
  number: number
  shaded: boolean
  colour: string
}

const Month = ({ number, shaded, colour }: MonthProps) => (
  <td
    className={shaded ? styles.shaded : styles.month}
    style={{ backgroundColor: colour } as React.CSSProperties}
  >
    <span className={styles.screenreader}>
      {number + 1}: {shaded ? 'yes' : 'no'}
    </span>
  </td>
)

const Content = ({ content, hide }: ContentData) => {
  const html = parseMarkdown(content)?.content || ''
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      className={hide ? styles.screenreader : undefined}
    />
  )
}
