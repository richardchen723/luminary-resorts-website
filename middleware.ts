import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const response = NextResponse.next()
  
  // Set pathname in header so layouts can access it
  response.headers.set('x-pathname', pathname)
  
  // If booking page has query params, add noindex header
  if (pathname.startsWith('/booking/') && searchParams.toString()) {
    response.headers.set('X-Robots-Tag', 'noindex, follow')
    return response
  }
  
  // Admin routes - middleware doesn't do auth checks anymore
  // Layouts and pages handle their own auth
  // This prevents redirect loops
  
  return response
}

export const config = {
  matcher: ['/booking/:path*', '/admin/:path*', '/api/admin/:path*'],
}
