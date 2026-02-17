import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/forgot-password/verify-otp',
    '/forgot-password/reset',
    '/welcome', // Allow welcome page for redirect flow
    '/403',     // Unauthorized page — accessible while logged in with wrong role
  ];
  const isPublicPath = publicPaths.includes(pathname);

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
