import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const response = NextResponse.next()
  
  // Set pathname in header so layouts can access it
  response.headers.set('x-pathname', pathname)
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:7',message:'Middleware entry',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  // If booking page has query params, add noindex header
  if (pathname.startsWith('/booking/') && searchParams.toString()) {
    response.headers.set('X-Robots-Tag', 'noindex, follow')
    return response
  }
  
  // Admin routes - middleware doesn't do auth checks anymore
  // Layouts and pages handle their own auth
  // This prevents redirect loops
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/b28ecb8f-e0a5-4667-81bf-490fe6e90b80',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'middleware.ts:20',message:'Middleware exit',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  return response
}

export const config = {
  matcher: ['/booking/:path*', '/admin/:path*', '/api/admin/:path*'],
}
