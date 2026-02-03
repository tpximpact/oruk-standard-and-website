/* eslint no-console: 'off' */

import forEachFile from './forEachFile.js'
import updateFrontMatter from './updateFrontMatter.js'

async function handleFile(filePath: string) {
  updateFrontMatter(
    filePath
    /*{
	  dryRun: true
	}*/
  )
}

forEachFile('./content', '.md', handleFile).catch((err: unknown) =>
  console.error('Error:', err instanceof Error ? err.message : String(err))
)
