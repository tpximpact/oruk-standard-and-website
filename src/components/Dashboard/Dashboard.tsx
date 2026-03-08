import { SortedAndPaginatedTable } from '@/components/SortedAndPaginatedTable'

interface DashboardResult {
  result: {
    definitions: {
      views: {
        dashboard: unknown
      }
    }
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
