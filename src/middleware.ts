import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  // Get the response
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: [
    '/((?!api/metrics|_next/static|_next/image|favicon.ico).*)',
  ],
};