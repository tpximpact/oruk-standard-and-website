import { NextResponse } from 'next/server'
import sitemapData from '../../../content/sitemap.json'

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
): Array<{ url: string; changeFrequency: ChangeFrequency; priority: number }> => {
  const sitemap: Array<{ url: string; changeFrequency: ChangeFrequency; priority: number }> = []

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

export async function GET() {
  const baseUrl = 'https://openreferraluk.org'

  // Add home page
  const pages = [
    {
      url: baseUrl,
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 1
    },
    ...processNodes(sitemapData as SitemapNode[], baseUrl)
  ]

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
