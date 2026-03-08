// manage a section that is generated on the fly - ie news
import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import { parseMarkdown } from '@/utilities/parseMarkdown'
import { PATHS } from './PATHS'
import { notFound } from 'next/navigation'

const CONTENT_ROOT = join(process.cwd(), PATHS.contentRoot)

interface DynamicPageContent {
  date: string
  metadata: Record<string, unknown>
  html: string
  next: LinkedItem | null
  previous: LinkedItem | null
}

interface LinkedItem {
  title: string
  path: string
  slug: string
}

interface ListItem {
  title: string
  path: string
  slug: string
}

export const getDynamicPageContent = (folder: string, slug: string): DynamicPageContent => {
  const file = join(folder, `${slug}.md`)
  const fileContents = readFile(file)
  const parsed = parseMarkdown(fileContents)
  const { frontmatter, content } = parsed!
  const allFiles = getAllFiles(folder)
  const index = allFiles.findIndex(file => slugify(file) === slug)

  return {
    date: getDate(frontmatter, file),
    metadata: frontmatter,
    html: content,
    next: buildLinkedItem(index + 1, allFiles, folder),
    previous: buildLinkedItem(index - 1, allFiles, folder)
  }
}

const buildLinkedItem = (index: number, allFiles: string[], folder: string): LinkedItem | null => {
  if (index < 0 || index >= allFiles.length) return null
  const fileName = allFiles[index]
  if (!fileName) return null
  return fileThumbnail(folder, fileName)
}

export const slugify = (fileName: string): string => {
  const parts = fileName.split('.')
  return parts[0] || fileName
}

export const getAllFiles = (contentFolder: string): string[] => {
  const dir = join(CONTENT_ROOT, contentFolder)
  const dirents = fs.readdirSync(dir, { withFileTypes: true })
  return dirents
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(f => f !== '.DS_Store')
}

const getDate = (metadata: Record<string, unknown>, contentPath: string): string => {
  const raw = metadata.modified || fileLastModified(contentPath)
  const date = new Date(raw)
  return date.toLocaleDateString('en-GB')
}

const fileThumbnail = (rootContentFolder: string, file: string): ListItem => {
  const contentPath = join(rootContentFolder, file)
  const contents = readFile(contentPath)
  const { data: metadata } = matter(contents)
  return {
    title: metadata.title,
    path: slugify(contentPath),
    slug: metadata.slug
  }
}

export const listDynamicSection = ({
  rootContentFolder
}: {
  rootContentFolder: string
}): ListItem[] => {
  const filenames = getAllFiles(rootContentFolder)
  return filenames.map(f => fileThumbnail(rootContentFolder, f))
}

const readFile = (contentPath: string): string => {
  try {
    return fs.readFileSync(join(CONTENT_ROOT, contentPath), 'utf8')
  } catch (err) {
    console.error(err)
    notFound()
  }
}

const statFile = (contentPath: string) => {
  try {
    return fs.statSync(join(CONTENT_ROOT, contentPath))
  } catch (err) {
    console.error(err)
    return null
  }
}

const fileLastModified = (contentPath: string): Date => {
  // NB mtime will be default if the file has been theough git - which is why we bake them into metadata
  const stats = statFile(contentPath)
  return stats!.mtime
}
