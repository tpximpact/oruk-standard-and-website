'use client'

import { useState, useEffect } from 'react'
import { PaginatedTable } from './_components/PaginatedTable'
import {
  TableSorting,
  getSortingOptions,
  getSortedRows,
  DIRECTION,
  type Column
} from './_components/TableSorting'
import { type Header } from './_components/PaginatedTable/DataTable'

export type { Column }

interface View {
  sortBy: string[]
  defaultSortBy: string
  defaultSortDirection: 'asc' | 'desc'
  rowsPerPage: number
  columns: string[]
  [key: string]: unknown
}

interface TableData {
  definitions: {
    columns: Record<string, Column>
  }
  data: Array<Record<string, unknown>>
}

interface SortedAndPaginatedTableProps {
  currentPage: number
  tableData: TableData
  view: View
}

export const SortedAndPaginatedTable = ({
  currentPage,
  tableData,
  view
}: SortedAndPaginatedTableProps) => {
  const headers = tableData.definitions.columns
  const [sortBy, setSortBy] = useState(view.defaultSortBy)
  const [sortDirection, setSortDirection] = useState(
    view.defaultSortDirection === 'asc' ? DIRECTION.ASCENDING : DIRECTION.DESCENDING
  )
  const [sortedRows, setSortedRows] = useState(tableData.data)
  const sortingOptions = getSortingOptions(view, tableData)

  const sort = () => {
    const data = JSON.parse(JSON.stringify(tableData))
    const newSortedRows = getSortedRows({
      sortColumn: sortBy,
      data: data,
      sortDirection: sortDirection
    })

    setSortedRows(newSortedRows)
  }

  useEffect(() => {
    sort()
  }, [sortBy, sortDirection])

  const changeSort = (newVal: string) => {
    setSortBy(newVal)
  }

  const changeDirection = (newVal: typeof DIRECTION.ASCENDING | typeof DIRECTION.DESCENDING) => {
    setSortDirection(newVal)
    sort()
  }

  return (
    <>
      <TableSorting
        values={sortingOptions}
        selectedValue={sortBy}
        selectedDirection={sortDirection}
        onValueChange={changeSort}
        onDirectionChange={changeDirection}
      />
      <PaginatedTable
        rowsPerPage={view.rowsPerPage}
        columns={view.columns}
        headers={headers as Record<string, Header>}
        rows={sortedRows}
        currentPage={currentPage}
      />
    </>
  )
}
