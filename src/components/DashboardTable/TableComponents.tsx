import type { ServiceData, SortField, SortDirection } from './types'
import styles from '../ServicesTable/ServicesTable.module.css'
import LinkComponent from './_components/LinkComponent'
import PassFailIndicator from '@/components/PassFailIndicator'
import LocalisedDate from '../ServicesTable/_components/LocalisedDate'

interface MobileSortSelectorProps {
  currentSort: SortField
  currentDirection: SortDirection
  onSort: (field: SortField) => void
}

export function MobileSortSelector({
  currentSort,
  currentDirection,
  onSort
}: MobileSortSelectorProps) {
  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'statusOverall', label: 'Feed passes' },
    { value: 'statusIsUp', label: 'Feed is live' },
    { value: 'statusIsValid', label: 'Feed is valid' },
    { value: 'schemaVersion', label: 'Schema Version' },
    { value: 'lastTested', label: 'Last Tested' }
  ]

  const directionLabel = currentDirection === 'asc' ? 'A-Z' : 'Z-A'

  return (
    <div className={styles.mobileSortContainer}>
      <label className={styles.sortLabel} htmlFor='mobile-sort'>
        Sort by:
      </label>
      <div className={styles.sortControls}>
        <select
          id='mobile-sort'
          className={styles.sortSelect}
          value={currentSort}
          onChange={e => onSort(e.target.value as SortField)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          className={styles.sortDirectionButton}
          onClick={() => onSort(currentSort)}
          aria-label={`Sort ${currentDirection === 'asc' ? 'descending' : 'ascending'}`}
        >
          <span className={styles.sortDirectionText}>{directionLabel}</span>
          <span className={styles.sortDirectionIcon}>{currentDirection === 'asc' ? '↑' : '↓'}</span>
        </button>
      </div>
    </div>
  )
}

interface ServiceCardProps {
  service: ServiceData
  index: number
}

export function ServiceCard({ service, index: _index }: ServiceCardProps) {
  const renderField = (label: string, data: ServiceData[keyof ServiceData]) => {
    if (!data) return null

    const displayValue = String(data.value)
    const { url } = data as { value: string; url?: string }

    // Handle status and time fields specially
    const content =
      typeof data.value === 'boolean' ? (
        <PassFailIndicator value={data.value} />
      ) : data.value instanceof Date ? (
        <LocalisedDate value={data.value} />
      ) : (
        <span>{displayValue}</span>
      )

    return (
      <div className={styles.cardField}>
        <dt className={styles.cardLabel}>{label}:</dt>
        <dd className={styles.cardValue}>
          {url ? <LinkComponent url={url}>{content}</LinkComponent> : content}
        </dd>
      </div>
    )
  }

  return (
    <div className={styles.serviceCard}>
      <dl className={styles.cardContent}>
        {renderField('Name', service.name)}
        {renderField('Feed passes', service.statusOverall)}
        {renderField('Feed is live', service.statusIsUp)}
        {renderField('Feed is valid', service.statusIsValid)}
        {renderField('Schema Version', service.schemaVersion)}
        {renderField('Last Tested', service.lastTested)}
      </dl>
    </div>
  )
}

interface TableCellProps {
  data: ServiceData[keyof ServiceData]
  className?: string
  columnKey?: keyof ServiceData
}

export function TableCell({ data, className, columnKey: _columnKey }: TableCellProps) {
  if (!data) {
    return <td className={className}>-</td>
  }

  const { value, url }: { value: string | number | boolean | Date | undefined; url?: string } = data

  // Ensure value is a string and handle potential objects
  const displayValue = value && value !== '[object Object]' ? String(value) : '-'

  // Apply different styling for description column
  const isBoolean = typeof value === 'boolean'
  const contentClass = isBoolean
    ? `${styles.cellContent} ${styles.booleanContent}`
    : styles.cellContent

  // Handle status field specially
  const content =
    typeof value === 'boolean' ? (
      <PassFailIndicator value={value} />
    ) : value instanceof Date ? (
      <LocalisedDate value={value} />
    ) : (
      <span className={contentClass} title={isBoolean ? undefined : displayValue}>
        {displayValue}
      </span>
    )

  if (url) {
    return (
      <td className={className}>
        <LinkComponent url={url}>{content}</LinkComponent>
      </td>
    )
  }

  return <td className={className}>{content}</td>
}

interface TableHeaderProps {
  label: string
  sortable: boolean
  currentSort?: 'asc' | 'desc' | null
  onSort?: () => void
  className?: string
}

export function TableHeader({ label, sortable, currentSort, onSort, className }: TableHeaderProps) {
  return (
    <th className={`${styles.th} ${className || ''}`}>
      {sortable ? (
        <button onClick={onSort} className={styles.sortButton}>
          {label}
          <span className={styles.sortIcon}>
            {currentSort === 'asc' && '↑'}
            {currentSort === 'desc' && '↓'}
            {!currentSort && '↕'}
          </span>
        </button>
      ) : (
        label
      )}
    </th>
  )
}
