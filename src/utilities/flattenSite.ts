import { getRawPageTree } from './getRawPageTree'

interface SiteItem {
  name?: string
  urlPath?: string
  contentPath?: string
  offsite?: boolean
  parent?: string
  childNodes?: string[] | SiteItem[]
  [key: string]: unknown
}

export const flattenSite = (): SiteItem[] => {
  return flatten(getRawPageTree())
}

const flatten = (a: SiteItem[], parent?: SiteItem): SiteItem[] => {
  a = JSON.parse(JSON.stringify(a))
  if (parent) {
    parent = JSON.parse(JSON.stringify(parent))
  }
  let result: SiteItem[] = []
  a.forEach(item => {
    let items: SiteItem[] = []
    if (parent) {
      item.parent = parent.name
      if (!item.offsite) {
        item.urlPath = parent.urlPath + '/' + item.urlPath
        item.contentPath = parent.contentPath + '/' + item.contentPath
      }
    }
    if (item.childNodes) {
      items = flatten(item.childNodes as SiteItem[], item)
      item.childNodes = (item.childNodes as SiteItem[]).map(child => child.name || '')
    }
    items.push(item)
    result = result.concat(items)
  })
  return result
}
