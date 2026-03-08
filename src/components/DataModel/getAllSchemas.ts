import { type SchemaData } from './Schema'

export const getAllSchemas = (data: Record<string, SchemaData> | null | undefined): string[] => {
  if (!data) return []
  return Object.keys(data)
    .sort()
    .map(key => data[key]?.name || key)
}
