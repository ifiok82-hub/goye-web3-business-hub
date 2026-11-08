import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/pi-app-validation.txt') return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/pi/')) return NextResponse.next();
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!pi-app-validation.txt|_next/static|_next/image|favicon.ico).*)',
  ],
};
