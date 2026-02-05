export interface ServiceData {
  name: { value: string; url?: string }
  publisher: { value: string; url?: string }
  comment: { value: string }
  developer: { value: string; url?: string }
  lastTested: { value: Date | undefined; url?: string }
}

export type SortField = keyof ServiceData
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface ServicesTableProps {
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
