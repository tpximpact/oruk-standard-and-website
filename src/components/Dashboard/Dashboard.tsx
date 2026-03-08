import { SortedAndPaginatedTable, type Column } from '@/components/SortedAndPaginatedTable'

interface DashboardView {
  sortBy: string[]
  defaultSortBy: string
  defaultSortDirection: 'asc' | 'desc'
  rowsPerPage: number
  columns: string[]
  [key: string]: unknown
}

interface DashboardResult {
  result: {
    definitions: {
      columns: Record<string, Column>
      views: {
        dashboard: DashboardView
      }
    }
    data: Array<Record<string, unknown>>
  }
}

interface DashboardProps {
  result: DashboardResult
  currentPage: number
}

export const Dashboard = ({
  result,
  currentPage /* ,method,endpoint,currentPage*/
}: DashboardProps) => {
  const view = result.result.definitions.views.dashboard

  return <SortedAndPaginatedTable view={view} tableData={result.result} currentPage={currentPage} />
}
