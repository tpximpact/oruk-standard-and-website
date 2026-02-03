/* eslint no-console: 'off' */

import fs from 'fs/promises'
import path from 'path'

/**
 * Recursively loop through directories and apply a function to files with a given extension.
 *
 * @param {string} dir - The directory to start searching in.
 * @param {string} ext - The file extension to filter by (e.g., '.txt').
 * @param {function} fn - The function to call on each matching file.
 * @returns {Promise<void>}
 */
async function forEachFile(dir: string, ext: string, fn: (fp: string) => Promise<void> | void) {
  try {
    // Ensure extension starts with a dot
    if (!ext.startsWith('.')) {
      ext = `.${ext}`
    }

    // Check if the directory exists
    const stats = await fs.stat(dir)
    if (!stats.isDirectory()) {
      throw new Error(`The path ${dir} is not a directory`)
    }

    // Read the contents of the directory
    const files = await fs.readdir(dir)

    // Process each file or directory in the directory
    for (const file of files) {
      const fullPath = path.join(dir, file)
      const fileStats = await fs.stat(fullPath)

      if (fileStats.isDirectory()) {
        // Recursively process subdirectories
        await forEachFile(fullPath, ext, fn)
      } else if (fileStats.isFile() && fullPath.endsWith(ext)) {
        // Apply the function on matching files
        await fn(fullPath)
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`Error processing directory ${dir}:`, msg)
  }
}

export default forEachFile

/*
// Example usage:
// Define a function that will be called on each file
async function handleFile(filePath) {
  console.log(`Processing file: ${filePath}`);
}

// Start the recursion from the current directory, looking for '.txt' files
forEachFile('./', '.txt', handleFile).catch(err => console.error('Error:', err));
*/
