import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import type { Metadata } from 'next'

// @ts-ignore CSS import required for styling
import '@/styles/reset.css'
// @ts-ignore CSS import required for styling
import '@/styles/tokens.css'
// @ts-ignore CSS import required for styling
import '@/styles/global.css'
// @ts-ignore CSS import required for styling
import '@/styles/no-js.css'
import { NoWarranty } from './_components/NoWarranty'
import { Header } from './_components/Header'
import { LandmarkMain } from './_components/LandmarkMain'
import { LandmarkContentInfo } from './_components/LandmarkContentInfo'
import { Cookies } from './_components/Cookies'
import { NoJsBanner } from './_components/NoJsBanner'
import { NoJsFallback } from './_components/NoJsFallback'
import { Crumbtrail } from './_components/Crumbtrail'
import { configValueToBoolean } from '@/utilities/configValueToBoolean'
import { getInfoMenuItems } from '@/utilities/getInfoMenuItems'

import { getRootLayoutItems } from '@/utilities/getRootLayoutItems'
import { CookieProvider } from './_components/CookieProvider'

import { Analytics } from '@vercel/analytics/next'

const font = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  generator: 'Next.js',
  applicationName: 'Open Referral UK',
  referrer: 'origin-when-cross-origin',
  keywords: ['open referral', 'ORUK', 'OR-UK'],
  creator: 'Open Referral UK',
  publisher: 'Open Referral UK',
  metadataBase: new URL('https://openreferraluk.org'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'Open Referral UK',
    description:
      'The open data standard which makes it easy to publish, find and use community services data',
    url: 'https://openreferraluk.org',
    siteName: 'Open Referral UK',
    locale: 'en_GB',
    type: 'website'
  },
  description:
    'Open Referral UK is a open data standard which makes it easy to publish, find and use community services data.'
}

interface WrapProps {
  children: ReactNode
}

const Wrap = ({ children }: WrapProps) => (
  <html lang='en' id='html' className='no-js'>
    <body className={`${font.className}`}>
      {children}
      <Analytics />
    </body>
  </html>
)

interface RootLayoutProps {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // const headerList = await headers();
  // const pathname = headerList.get("x-current-path");
  // console.log ("--> " + pathname)

  const items = getRootLayoutItems()
  return (
    <Wrap>
      <CookieProvider>
        <div style={{ maxWidth: '100vw' }}>
          {configValueToBoolean(process.env.USE_COOKIES) ? <Cookies /> : null}
          <NoJsBanner />
          <Header items={items as any} enableMenu={configValueToBoolean(process.env.USE_NAV)} />
          <LandmarkMain>
            {configValueToBoolean(process.env.USE_NOWARRANTY) ? <NoWarranty /> : null}
            {configValueToBoolean(process.env.USE_NAV) ? (
              <Crumbtrail />
            ) : (
              <div style={{ height: '4rem' }}></div>
            )}

            {children}
          </LandmarkMain>
        </div>
        <LandmarkContentInfo
          infoItems={(getInfoMenuItems() || []) as any}
          showNav={configValueToBoolean(process.env.USE_NAV)}
        />
        <NoJsFallback />
      </CookieProvider>
    </Wrap>
  )
}
