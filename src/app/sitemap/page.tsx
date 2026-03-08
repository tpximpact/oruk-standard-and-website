import { Sitemap } from '@/components/Sitemap'
import { getRawPageTree } from '@/utilities/getRawPageTree'
import { siteStructureWithFullPaths } from '@/utilities/menuing'
import { Metadata } from 'next'
import type { ComponentProps } from 'react'

export default function Page() {
  const sitemapData = siteStructureWithFullPaths(getRawPageTree()) as unknown as ComponentProps<
    typeof Sitemap
  >['data']

  return <Sitemap showHeading={true} data={sitemapData} />
}

export const metadata: Metadata = {
  title: 'ORUK sitemap'
}
