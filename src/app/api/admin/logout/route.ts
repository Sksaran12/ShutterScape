import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Signed out.',
  });
  response.cookies.set(ADMIN_COOKIE, '', adminCookieOptions(0));
  return response;
}
