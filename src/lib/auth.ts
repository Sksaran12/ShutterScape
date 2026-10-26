import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export const ADMIN_COOKIE = 'admin_token';
export const ADMIN_SESSION_HOURS = 8;

export interface AdminSession {
  id: string;
  email: string;
  role: 'admin';
}

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export function isAuthConfigured(): boolean {
  return getJwtSecret() !== null;
}

export async function createAdminToken(
  session: AdminSession
): Promise<string | null> {
  const secret = getJwtSecret();
  if (!secret) return null;

  return new SignJWT({ email: session.email, role: session.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.id)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_HOURS}h`)
    .sign(secret);
}

export async function verifyAdminToken(
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token) return null;
  const secret = getJwtSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    if (!payload.sub || typeof payload.email !== 'string') return null;
    return {
      id: payload.sub,
      email: payload.email,
      role: 'admin',
    };
  } catch {
    return null;
  }
}

/**
 * Server-side authorization for every admin API handler.
 * Middleware is a first gate; this second check means a route can never be
 * written to without a valid signed session, even if the matcher changes.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

export function adminCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}
