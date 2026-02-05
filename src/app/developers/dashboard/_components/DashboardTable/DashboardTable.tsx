'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type {
  DashboardTableProps,
  SortConfig,
  SortField,
  SortDirection,
  TableHeaderConfig
} from './types'
import { useSortedData, usePaginatedData } from './hooks'
import { TableHeader, TableCell, ServiceCard, MobileSortSelector } from './TableComponents'
import { Pagination } from './_components/Pagination'
import styles from './ServicesTable.module.css'

const TABLE_HEADERS: TableHeaderConfig[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'statusOverall', label: 'Feed passes', sortable: true },
  { key: 'statusIsUp', label: 'Feed is live', sortable: true },
  { key: 'statusIsValid', label: 'Feed is valid', sortable: true },
  {
    key: 'schemaVersion',
    label: 'Schema Version',
    sortable: true,
    className: styles.hiddenOnTablet
  },
  { key: 'lastTested', label: 'Last Tested', sortable: true, className: styles.hiddenOnMobile }
]

export function DashboardTable({
  services,
  currentPage = 1,
  itemsPerPage = 10
}: DashboardTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get initial sort from URL params or default to name ascending
  const initialSortField = (searchParams.get('sort') as SortField) || 'name'
  const initialSortDirection = (searchParams.get('direction') as SortDirection) || 'asc'

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: initialSortField,
    direction: initialSortDirection
  })

  const sortedData = useSortedData(services, sortConfig)
  const paginationInfo = usePaginatedData(sortedData, currentPage, itemsPerPage)

  const handleSort = (field: SortField) => {
    const newDirection: SortDirection =
      sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'

    const newSortConfig = { field, direction: newDirection }
    setSortConfig(newSortConfig)

    // Update URL with new sort parameters
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', field)
    params.set('direction', newDirection)

    // Reset to page 1 when sorting
    params.delete('page')

    router.push(`/developers/dashboard?${params.toString()}`, { scroll: false })
  }

  const getSortDirection = (field: SortField): 'asc' | 'desc' | null => {
    return sortConfig.field === field ? sortConfig.direction : null
  }

  return (
    <div className={styles.table}>
      {/* Mobile Card View */}
      <div className={styles.mobileView}>
        <MobileSortSelector
          currentSort={sortConfig.field}
          currentDirection={sortConfig.direction}
          onSort={handleSort}
        />
        {paginationInfo.paginatedData.length > 0 ? (
          paginationInfo.paginatedData.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))
        ) : (
          <div className={styles.emptyState}>No services found.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className={styles.desktopView}>
        <div className={styles.tableContainer}>
          <table className={styles.htmlTable}>
            <thead className={styles.thead}>
              <tr className={styles.tr}>
                {TABLE_HEADERS.map(header => (
                  <TableHeader
                    key={header.key}
                    label={header.label}
                    sortable={header.sortable}
                    currentSort={getSortDirection(header.key)}
                    onSort={() => header.sortable && handleSort(header.key)}
                    className={header.className}
                  />
                ))}
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {paginationInfo.paginatedData.length > 0 ? (
                paginationInfo.paginatedData.map((service, index) => (
                  <tr key={index} className={styles.tr}>
                    {TABLE_HEADERS.map(header => (
                      <TableCell
                        key={`${index}-${header.key}`}
                        data={service[header.key]}
                        columnKey={header.key}
                        className={`${styles.td} ${header.className || ''}`}
                      />
                    ))}
                  </tr>
                ))
              ) : (
                <tr className={styles.tr}>
                  <td colSpan={TABLE_HEADERS.length} className={styles.emptyState}>
                    No services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={paginationInfo.totalPages}
        totalItems={paginationInfo.totalItems}
        itemsPerPage={itemsPerPage}
        startIndex={paginationInfo.startIndex}
        endIndex={paginationInfo.endIndex}
        basePath='/developers/dashboard'
      />
    </div>
  )
}
