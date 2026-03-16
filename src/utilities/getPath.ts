import { join } from 'path'
import { PATHS } from './PATHS'

export const getPath = (dir: string): string => join(PATHS.contentRoot, dir)
