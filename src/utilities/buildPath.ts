import { join } from 'path'
import { PATHS } from './PATHS'

export const buildPath = (contentPath: string): string => {
  const result = join(process.cwd(), PATHS.contentRoot, contentPath)
  return result
}
