import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

/** Methods that cannot change server state, so they need no CSRF gate. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const MIN_SECRET_LENGTH = 32;

/**
 * Resolves the signing key. Returns null when the environment is misconfigured
 * so callers can fail closed instead of verifying with an empty key.
 */
function getSecret(): Uint8Array | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return new TextEncoder().encode(secret);
}

/**
 * Blocks cross-site state-changing requests. Browsers always send Origin on
 * non-GET requests, so a mismatch means the call did not come from this origin.
 * Requests without an Origin header (curl, server-to-server) are allowed and
 * still need a valid session cookie.
 */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const candidates = new Set<string>();
  const host = request.headers.get('host');
  if (host) candidates.add(host.trim());
  if (!host) {
    // Only used when an upstream proxy removed the Host header entirely.
    const forwardedHost = request.headers.get('x-forwarded-host');
    if (forwardedHost) {
      for (const part of forwardedHost.split(',')) {
        const value = part.trim();
        if (value) candidates.add(value);
      }
    }
  }

  return candidates.has(originHost);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin/* (except /admin/login) and /api/admin/* (except login/logout)
  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const isAdminApi =
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/login') &&
    !pathname.startsWith('/api/admin/logout');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (isAdminApi && !SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
    return NextResponse.json(
      { success: false, message: 'Cross-origin request blocked.' },
      { status: 403 }
    );
  }

  const secret = getSecret();
  if (!secret) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, message: 'Admin access is not configured on the server.' },
        { status: 503 }
      );
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return NextResponse.next();
  } catch {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session.' },
        { status: 401 }
      );
    }
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
