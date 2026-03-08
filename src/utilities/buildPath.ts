import { join } from 'path'
import { PATHS } from './PATHS'

export const buildPath = (contentPath: string): string => {
  const result = join(PATHS.contentRoot, contentPath)
  return result
}
