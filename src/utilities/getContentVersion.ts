import { join } from 'path'
import { getAllFilesInFolderWithExtension } from './getAllFilesInFolderWithExtension'
import { filenameToName } from './filenameToName'
import { read } from './read'
import { parseMarkdown } from './parseMarkdown'
import { basename } from 'path'
import fs from 'fs'
import { unNestSchemata } from './unNestSchemata'
import { SchemaResolver } from './SchemaResolver'
import { SchemaResolver } from './SchemaResolver'

interface ContentVersionOptions {
  contentFolder: string
  specificationFolderPath: string
}

export const getContentVersion = ({
  contentFolder,
  specificationFolderPath
}: ContentVersionOptions) => {
  try {
    // load markdown content
    const contentFileName = basename(specificationFolderPath) + '.md'
    const contentFilePath = join(contentFolder, contentFileName)
    const contentRaw = read(contentFilePath)
    const contentParsed = contentRaw ? parseMarkdown(contentRaw)?.content : ''

    // load root json specification
    const rootSpecFileName = 'openapi.json'
    const rootSpecFilePath = join('../', specificationFolderPath, rootSpecFileName)
    const rootSpecRaw = read(rootSpecFilePath)

    if (!rootSpecRaw) {
      console.warn(`Specification file not found: ${rootSpecFilePath}`)
      return {
        htmlContent: contentParsed || '',
        rootSpec: {
          json: '',
          parsed: {}
        },
        schemata: {}
      }
    }

    const rootSpecParsed = JSON.parse(rootSpecRaw)

    // Resolve all external schema references at runtime
    const schemaDir = join(process.cwd(), specificationFolderPath, 'schema')
    const resolver = new SchemaResolver(schemaDir)
    const rootSpecResolved = resolver.resolve(rootSpecParsed)

    // load schemata from root
    let schemata = rootSpecResolved.components?.schemas || {}
    schemata = unNestSchemata(schemata) // some schemata - ie v1.0 has nested properties :-(

    // load schemata from file system
    const schemaFolder = join(specificationFolderPath, 'schema')
    const fullPath = join(process.cwd(), schemaFolder)
    try {
      if (fs.statSync(fullPath).isDirectory()) {
        const schemaFiles = getAllFilesInFolderWithExtension(schemaFolder, 'json')
        schemaFiles.forEach(schemaFile => {
          const rawJson = fs.readFileSync(join(fullPath, schemaFile), 'utf8')
          const k = filenameToName(schemaFile)
          schemata[k!] = JSON.parse(rawJson)
        })
      }
    } catch {
      // console.log('nope: ' + fullPath)
    }

    // HACK: in case the Pages object is present amongst schemata, remove it
    delete schemata.Page
    delete schemata.page

    // build object and return
    return {
      htmlContent: contentParsed || '',
      rootSpec: {
        json: rootSpecRaw,
        parsed: rootSpecResolved // Use resolved version for display
      },
      schemata: schemata
    }
  } catch (error) {
    console.error('Error loading content version:', error)
    return {
      htmlContent: '',
      rootSpec: {
        json: '',
        parsed: {}
      },
      schemata: {}
    }
  }
}
