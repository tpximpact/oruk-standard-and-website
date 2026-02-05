export interface ServiceData {
  name: { value: string; url?: string }
  statusOverall?: { value: boolean; url?: string }
  statusIsUp: { value: boolean; url?: string }
  statusIsValid: { value: boolean; url?: string }
  schemaVersion: { value: string; url?: string }
  lastTested: { value: Date | undefined; url?: string }
}

export type SortField = keyof ServiceData
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface DashboardTableProps {
  services: ServiceData[]
  currentPage?: number
  itemsPerPage?: number
}

export interface TableHeaderConfig {
  key: SortField
  label: string
  sortable: boolean
  className?: string
}
