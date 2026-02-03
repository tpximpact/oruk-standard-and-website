import type { MetadataRoute } from 'next'
import sitemapData from '@/../../content/sitemap.json'

interface SitemapNode {
  name: string
  label: string
  urlPath?: string
  hide?: boolean
  offsite?: boolean
  childNodes?: SitemapNode[]
}

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

const getPriorityForDepth = (depth: number): number => {
  if (depth === 0) return 1.0 // Home page
  if (depth === 1) return 0.8 // Main sections
  if (depth === 2) return 0.7 // Subsections
  return 0.5 // Deeper pages
}

const getChangeFrequency = (name: string, depth: number): ChangeFrequency => {
  // Pages that change frequently
  if (name === 'dashboard') return 'daily'
  if (name === 'directory') return 'weekly'
  if (name === 'validator') return 'weekly'

  // Default based on depth
  if (depth === 0) return 'weekly'
  return 'monthly'
}

const processNodes = (
  nodes: SitemapNode[],
  baseUrl: string,
  parentPath: string = '',
  depth: number = 0
): MetadataRoute.Sitemap => {
  const sitemap: MetadataRoute.Sitemap = []

  nodes.forEach(node => {
    // Skip hidden nodes
    if (node.hide) return

    // Skip offsite links
    if (node.offsite) return

    // Build the URL
    let nodeUrl = ''
    if (depth === 0) {
      // Root level
      nodeUrl = node.urlPath ? `${baseUrl}/${node.urlPath}` : baseUrl
    } else {
      // Child level
      nodeUrl = `${parentPath}/${node.urlPath}`
    }

    // Add this node to the sitemap
    sitemap.push({
      url: nodeUrl,
      lastModified: new Date(),
      changeFrequency: getChangeFrequency(node.name, depth),
      priority: getPriorityForDepth(depth)
    })

    // Process child nodes
    if (node.childNodes && node.childNodes.length > 0) {
      const childSitemap = processNodes(node.childNodes, baseUrl, nodeUrl, depth + 1)
      sitemap.push(...childSitemap)
    }
  })

  return sitemap
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://openreferraluk.org'

  // Add home page
  const homePage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    }
  ]

  // Process all sitemap nodes
  const pages = processNodes(sitemapData as SitemapNode[], baseUrl)

  return [...homePage, ...pages]
}
