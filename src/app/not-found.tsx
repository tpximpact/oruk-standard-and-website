import { Sitemap } from '@/components/Sitemap'
import { getRawPageTree } from '@/utilities/getRawPageTree'
import { siteStructureWithFullPaths } from '@/utilities/menuing'
import { NamedMarkdownPage } from '@/components/NamedMarkdownPage'
import { Banner } from '@/components/Banner'
import { PageMargin } from '@/components/PageMargin'
import { Metadata } from 'next'
import type { ComponentProps } from 'react'

export const metadata: Metadata = {
  title: 'Open Referral UK'
}

export default function Page() {
  const sitemapData = siteStructureWithFullPaths(getRawPageTree()) as unknown as ComponentProps<
    typeof Sitemap
  >['data']

  return (
    <>
      <NamedMarkdownPage name='not-found' />
      <PageMargin>
        <Banner>
          <span
            style={{
              fontWeight: 700
            }}
          >
            We have reorganised our website recently so the content for which you are looking for
            may have been moved to a different location. Please use the site map below or return to
            the <a href='/'>home page.</a>
          </span>
        </Banner>
      </PageMargin>
      <Sitemap showHeading={false} data={sitemapData} />
    </>
  )
}
