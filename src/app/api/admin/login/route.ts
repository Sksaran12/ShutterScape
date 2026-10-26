import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase, isDatabaseConfigured } from '@/lib/db';
import Admin from '@/models/Admin';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_HOURS,
  adminCookieOptions,
  createAdminToken,
  isAuthConfigured,
} from '@/lib/auth';
import { firstZodError, loginSchema } from '@/lib/validation';
import { getClientKey, rateLimit } from '@/lib/rate-limit';
import { serverError } from '@/lib/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Compared against when the email does not exist so that a missing account and
 * a wrong password take the same time. Prevents account enumeration by timing.
 */
const DUMMY_PASSWORD_HASH =
  '$2b$12$9pmor4rOHvtkT17/V7VOJeTZ0p0kjY.o20FC.KSgIj8OQd4Mcn3h.';

export async function POST(request: Request) {
  const limit = rateLimit(getClientKey(request, 'admin-login'), 5, 15 * 60_000);
  if (!limit.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Too many sign-in attempts. Please wait before trying again.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds) },
      }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Admin sign-in is unavailable until MONGODB_URI is configured on the server.',
      },
      { status: 503 }
    );
  }

  if (!isAuthConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Admin sign-in is unavailable until NEXTAUTH_SECRET is configured on the server.',
      },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: firstZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const admin = await Admin.findOne({ email: parsed.data.email });

    // Always run a bcrypt comparison, even for unknown emails, so response
    // timing does not reveal whether an account exists.
    const valid = await bcrypt.compare(
      parsed.data.password,
      admin?.hashedPassword ?? DUMMY_PASSWORD_HASH
    );
    if (!admin || !valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = await createAdminToken({
      id: admin._id.toString(),
      email: admin.email,
      role: 'admin',
    });

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication is not configured.' },
        { status: 503 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed in.',
      data: { email: admin.email },
    });
    response.cookies.set(
      ADMIN_COOKIE,
      token,
      adminCookieOptions(ADMIN_SESSION_HOURS * 60 * 60)
    );
    return response;
  } catch (error) {
    return serverError(error, '[POST /api/admin/login]');
  }
}
