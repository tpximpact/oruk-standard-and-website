import { flattenSite } from '../utilities/flattenSite'
import { slugify } from '../utilities/dynamicSection'
import fs from 'fs'
import { join } from 'path'
import { test, expect, Page } from '@playwright/test'

interface ReachablePage {
  path: string
  lookFor?: string
}

const getAllFiles = (contentFolder: string) => {
  const dir = join(process.cwd(), '/content', contentFolder)
  const dirents = fs.readdirSync(dir, { withFileTypes: true })
  return dirents
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name)
    .filter(f => f !== '.DS_Store')
}

const site = flattenSite().filter(p => !p.offsite)
const nonDynamicPages: ReachablePage[] = site
  .filter(p => p.urlPath && p.name && !String(p.urlPath).includes('undefined'))
  .map(page => ({
    path: '/' + page.urlPath,
    lookFor:
      typeof page.e2eTestLookFor === 'string' ? page.e2eTestLookFor : String(page.e2eTestLookFor)
  }))

const dynamicPages: ReachablePage[] = site
  .filter(p => p.dynamic && p.contentPath && p.name)
  .flatMap(root => {
    const dirPath = join(process.cwd(), '/content', root.contentPath!)
    if (!fs.existsSync(dirPath)) return []
    return getAllFiles(root.contentPath!)
      .map(n => slugify(n))
      .filter(s => s && s !== 'undefined')
      .map(s => ({ path: `${root.contentPath}/${s}`, lookFor: 'open' }))
  })

const data: ReachablePage[] = nonDynamicPages
  .concat(dynamicPages)
  .filter((value, index, self) => self.findIndex(v => v.path === value.path) === index)

test.describe('Page Content Validation Tests', () => {
  data.forEach(({ path, lookFor = 'open' }: { path: string; lookFor?: string }) => {
    test(`should find "${lookFor}" on ${path}`, async ({ page }: { page: Page }) => {
      // Navigate and capture response, then check status
      const response = await page.goto(path)
      expect(response).not.toBeNull()
      expect(response!.status()).toBe(200)

      const bodyText = await page.textContent('body')
      expect(bodyText).toContain(lookFor || 'open')
    })
  })
})
