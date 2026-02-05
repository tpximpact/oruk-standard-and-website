'use client'

import { useMemo } from 'react'
import type { ServiceData, SortConfig } from './types'

export function useSortedData(data: ServiceData[], sortConfig: SortConfig | null) {
  return useMemo(() => {
    if (!sortConfig) return data

    const sortedData = [...data].sort((a, b) => {
      const aValue = a[sortConfig.field]?.value || ''
      const bValue = b[sortConfig.field]?.value || ''

      // Handle date sorting
      if (
        sortConfig.field === 'lastTested' &&
        typeof aValue === 'string' &&
        typeof bValue === 'string'
      ) {
        const aDate = new Date(aValue).getTime()
        const bDate = new Date(bValue).getTime()
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
      }

      // Handle string sorting
      const comparison = aValue.toString().localeCompare(bValue.toString())
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })

    return sortedData
  }, [data, sortConfig])
}

export function usePaginatedData<T>(data: T[], currentPage: number, itemsPerPage: number) {
  return useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    return {
      paginatedData: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / itemsPerPage),
      totalItems: data.length,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, data.length)
    }
  }, [data, currentPage, itemsPerPage])
}
