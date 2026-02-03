import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/internal']
    },
    sitemap: 'https://openreferraluk.org/sitemap.xml'
  }
}
