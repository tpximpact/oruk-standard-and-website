export const groupBy = <T extends Record<string, unknown>>(
  array: T[],
  property: keyof T
): Record<string, T[]> => {
  return array.reduce(
    (acc, obj) => {
      const key = String(obj[property])
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    },
    {} as Record<string, T[]>
  )
}
