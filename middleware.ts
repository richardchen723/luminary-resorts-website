import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // If booking page has query params, add noindex header
  if (pathname.startsWith('/booking/') && searchParams.toString()) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, follow')
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/booking/:path*',
}
