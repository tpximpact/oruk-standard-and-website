import { NextRequest, NextResponse } from 'next/server'
import redirects from './redirects.json'

function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let nonce = ''
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return nonce
}

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

  // Generate nonce for CSP
  const nonce = generateNonce()
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })

  // Set CSP header with dynamic nonce
  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' https://va.vercel-scripts.com https://vercel.live 'nonce-${nonce}'`,
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
  response.headers.set('x-nonce', nonce)

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
