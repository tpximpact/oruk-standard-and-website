import { NextRequest, NextResponse } from 'next/server'
import redirects from './redirects.json'

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone()

  const { hostname } = url

  // Hostname based redirect
  const targetPath = redirects[hostname as keyof typeof redirects]
  if (targetPath) {
    const isAbsolute = targetPath.startsWith('http')
    const redirectUrl = isAbsolute
      ? new URL('/', targetPath)
      : new URL(targetPath, 'https://openreferraluk.org')

    return NextResponse.redirect(redirectUrl, 308)
  }

  // Create response
  const response = NextResponse.next()

  // Set CSP header - using 'unsafe-inline' to allow inline scripts flexibly
  // Note: When nonce is present, 'unsafe-inline' is ignored, so we remove nonce
  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' https://va.vercel-scripts.com https://vercel.live 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https://openreferraluk.org https://*.vercel-scripts.com`,
    `font-src 'self' data:`,
    `connect-src 'self' https://va.vercel-scripts.com https://*.herokuapp.com https://vercel.live`,
    `frame-src 'self' https://vercel.live`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

// Run on all paths so we can catch root-level requests too
export const config = {
  // Path-only filter: run on app routes, skip API/static/assets.
  // Host-based matching is not supported by matcher; we gate by hostname in code.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\..*).*)'
  ]
}
