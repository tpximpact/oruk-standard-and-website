export const isDeepEqual = (object1: unknown, object2: unknown): boolean => {
  if (!isObject(object1) || !isObject(object2)) return false

  const keys1 = Object.keys(object1)
  const keys2 = Object.keys(object2)

  const record1 = object1 as Record<string, unknown>
  const record2 = object2 as Record<string, unknown>

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false

    const value1 = record1[key]
    const value2 = record2[key]

    if (isObject(value1) && isObject(value2)) {
      if (!isDeepEqual(value1, value2)) return false
    } else if (value1 !== value2) {
      return false
    }
  }

  return true
}

const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === 'object'
}
