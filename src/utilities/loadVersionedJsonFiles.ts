import { join } from 'path'
import { getAllFilesInFolder } from './getAllFilesInFolder'
import { read } from './read'

const versionedContentVersionFromFilename = (filename: string): string => {
  const name = filename.split('.')[0] + ''
  return name.replace('_', '.')
}

export const loadVersionedJsonFiles = (
  contentFolder: string
): [string[], Record<string, unknown>] => {
  const files = getAllFilesInFolder(contentFolder).filter(f => f.split('.')[1] === 'json')
  const contentData: Record<string, unknown> = {}
  files.forEach(file => {
    const version = versionedContentVersionFromFilename(file)
    const filePath = join(contentFolder, file)

    const fileContents = read(filePath)
    contentData[version] = JSON.parse(fileContents!)
  })

  return [Object.keys(contentData).sort().reverse(), contentData]
}
