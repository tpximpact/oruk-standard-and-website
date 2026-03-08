import { getSubdirectories } from './getSubdirectories'
import { getContentVersion } from './getContentVersion'
import { basename } from 'path'

interface ContentVersionOptions {
  contentFolder: string
  specificationFolder: string
}

type ContentVersion = ReturnType<typeof getContentVersion>

export const getAllContentVersions = ({
  contentFolder,
  specificationFolder
}: ContentVersionOptions) => {
  const versions = getSubdirectories(specificationFolder)

  return versions.reduce(
    (result, versionPath) => ({
      ...result,
      [basename(versionPath)]: getContentVersion({
        contentFolder,
        specificationFolderPath: versionPath
      })
    }),
    {} as Record<string, ContentVersion>
  )
}
