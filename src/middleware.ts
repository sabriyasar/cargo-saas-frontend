// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Shopify bazen HEAD isteği atıyor — bunu GET olarak karşılayalım
  if (req.method === 'HEAD') {
    const url = req.nextUrl.clone();
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/shopify/:path*'],
};
