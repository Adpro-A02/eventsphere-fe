import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  // Get the response
  const response = NextResponse.next();
  
  // Log the request (this uses both variables, fixing ESLint errors)
  const duration = Date.now() - start;
  console.log(`${request.method} ${request.nextUrl.pathname} - ${response.status} - ${duration}ms`);
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api/metrics|_next/static|_next/image|favicon.ico).*)',
  ],
};