export function middleware(request: any) {
  if (request?.nextUrl?.pathname === '/pi-app-validation.txt') {
    return (Response as any).next ? (Response as any).next() : new Response(null);
  }
  return (Response as any).next ? (Response as any).next() : new Response(null);
}

export const config = {
  matcher: [
    '/((?!pi-app-validation.txt|_next/static|_next/image|favicon.ico).*)',
  ],
};
