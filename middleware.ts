import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the Basic Auth credentials from environment variables
  const basicAuth = request.headers.get('authorization');
  const url = request.nextUrl;

  // Skip authentication for static files and Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('/favicon.ico') ||
    url.pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Get credentials from environment variables
  const username = process.env.BASIC_AUTH_USERNAME || 'admin';
  const password = process.env.BASIC_AUTH_PASSWORD || 'password';

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [providedUsername, providedPassword] = atob(authValue).split(':');

    if (providedUsername === username && providedPassword === password) {
      return NextResponse.next();
    }
  }

  // Return 401 Unauthorized if credentials are missing or incorrect
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: '/:path*',
};