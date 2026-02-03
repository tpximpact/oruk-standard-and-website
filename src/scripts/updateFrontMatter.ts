/* eslint no-console: 'off' */

import fs from 'fs/promises'
import jsYaml from 'js-yaml'
import path from 'path'

/**
 * Updates the YAML front matter in a Markdown file with the file's modified date.
 *
 * @param {string} filePath - Path to the Markdown file.
 * @param {Object} [options] - Optional settings.
 * @param {boolean} [options.force=false] - Force update even if modified date is current.
 * @param {string} [options.dateProperty='modified'] - Property name for the date.
 * @param {string} [options.dateFormat='ISO'] - Date format (ISO, RFC2822, or custom).
 * @param {boolean} [options.dryRun=false] - Simulate update without writing to file.
 * @returns {Promise<void>}
 */
async function updateFrontMatter(
  filePath: string,
  options: {
    force?: boolean
    dateProperty?: string
    dateFormat?: string
    dryRun?: boolean
  } = {}
) {
  const { force = false, dateProperty = 'modified', dateFormat = 'ISO', dryRun = false } = options

  try {
    // Get file stats
    const stats = await fs.stat(filePath)
    let date

    switch (dateFormat) {
      case 'ISO':
        date = new Date(stats.mtimeMs).toISOString()
        break
      case 'RFC2822':
        date = new Date(stats.mtimeMs).toUTCString()
        break
      default:
        date = new Date(stats.mtimeMs).toLocaleString(dateFormat)
    }

    // Read file contents
    const fileContent = await fs.readFile(filePath, 'utf8')
    let frontMatter: Record<string, unknown>
    let content: string
    // Parse front matter
    const frontMatterRegex = /^---\n(.*?)\n---\n/s
    const match = fileContent.match(frontMatterRegex)
    if (!match) {
      frontMatter = {}
      content = fileContent
    } else {
      const frontMatterYaml = match[1] || ''
      content = fileContent.replace(frontMatterRegex, '')

      // Load front matter YAML
      frontMatter = (jsYaml.load(frontMatterYaml) as Record<string, unknown>) || {}

      // Check if date property exists and is current
      const currentDate = new Date()
      const existingDate = frontMatter[dateProperty]
      if (existingDate && !force) {
        const existingDateObject = new Date(existingDate as string | number)
        if (
          existingDateObject.getFullYear() === currentDate.getFullYear() &&
          existingDateObject.getMonth() + 1 === currentDate.getMonth() + 1 &&
          existingDateObject.getDate() === currentDate.getDate()
        ) {
          console.log(`Front matter for ${path.basename(filePath)} is up-to-date.`)
          return
        }
      }
    }
    // Update date property
    frontMatter[dateProperty] = date

    // Dump updated front matter YAML
    const updatedFrontMatterYaml = jsYaml.dump(frontMatter)

    // Update file contents
    const updatedFileContent = `---\n${updatedFrontMatterYaml}---\n${content}`

    if (dryRun) {
      console.log(`Dry run: Front matter update for ${path.basename(filePath)}:`)
      console.log(updatedFileContent)
    } else {
      // Write updated file contents
      await fs.writeFile(filePath, updatedFileContent)
      console.log(`Front matter updated successfully for ${path.basename(filePath)}`)
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`Error updating front matter: ${msg}`)
    throw error
  }
}

export default updateFrontMatter
