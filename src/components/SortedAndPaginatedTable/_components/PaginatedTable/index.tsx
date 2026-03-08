'use client'

import { useState, useEffect } from 'react'
import { Pagination } from './_components'
import { DataTable } from './DataTable'

interface PaginatedTableProps {
  currentPage: number
  rows: Array<Record<string, unknown>>
  rowsPerPage: number
  columns: string[]
  headers: Record<string, unknown>
}

interface ViewProps extends PaginatedTableProps {
  pageChangeFunction: (event: unknown, page: number) => void
}

export const PaginatedTable = (props: PaginatedTableProps) => {
  const [clientSide, setClientSide] = useState(false)

  useEffect(() => {
    setClientSide(true)
  }, [])

  return clientSide ? <InteractiveView {...props} /> : <NoJSView {...props} />
}

const NoJSView = ({ currentPage, ...props }: PaginatedTableProps) => (
  <View
    //title="NoJS"
    currentPage={currentPage}
    pageChangeFunction={() => {}}
    {...props}
  />
)

const InteractiveView = ({ currentPage, ...props }: PaginatedTableProps) => {
  const [activePage, setActivePage] = useState(currentPage)

  const selectPage = (_: unknown, n: number) => setActivePage(n)

  return (
    <View
      //title="Interactive"
      pageChangeFunction={selectPage}
      currentPage={activePage}
      {...props}
    />
  )
}

const calculateNumPages = ({
  numRows,
  rowsPerPage
}: {
  numRows: number
  rowsPerPage: number
}): number => Math.ceil(numRows / rowsPerPage)

const paginateRows = ({
  currentPage,
  rows,
  rowsPerPage
}: {
  currentPage: number
  rows: Array<Record<string, unknown>>
  rowsPerPage: number
}): Array<Record<string, unknown>> => {
  const offset = (currentPage - 1) * rowsPerPage
  return rows.slice(offset, offset + rowsPerPage)
}

const View = ({
  //title,
  pageChangeFunction,
  currentPage,
  rows,
  rowsPerPage,
  ...props
}: ViewProps) => {
  const baseUrl = '/developer/tools/dashboard?page='

  const numPages = calculateNumPages({
    numRows: rows.length,
    rowsPerPage: rowsPerPage
  })

  const pagedRows =
    numPages > 1
      ? paginateRows({
          currentPage: currentPage,
          rows: rows,
          rowsPerPage: rowsPerPage
        })
      : rows

  return (
    <div>
      {/*<div>
			{title} version. CurrentPage = <strong>{currentPage}</strong>
		</div>*/}
      <DataTable {...props} rows={pagedRows} />
      {numPages > 1 ? (
        <Pagination
          baseUrl={baseUrl}
          numPages={numPages}
          currentPage={currentPage}
          pageChangeFunction={pageChangeFunction}
        />
      ) : null}
    </div>
  )
}

/*

<DataTable
				columns={columns}
				headers={headers}
				showDetails={showDetails}
				detailsURL={detailsURL}
				rows={rows}
			/>
*/
