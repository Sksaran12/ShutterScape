import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConfigured } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { getClientKey, rateLimit } from '@/lib/rate-limit';
import {
  dbUnavailable,
  serverError,
  tooManyRequests,
  unauthorized,
} from '@/lib/http';
import Member from '@/models/Member';
import { firstZodError, memberCreateSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await getAdminSession())) return unauthorized();
  if (!isDatabaseConfigured()) return dbUnavailable();

  try {
    await connectToDatabase();
    const items = await Member.find()
      .sort({ memberCategory: 1, displayOrder: 1 })
      .lean();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return serverError(error, '[GET /api/admin/members]');
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  const limit = rateLimit(getClientKey(request, 'admin-write'), 60, 60_000);
  if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

  if (!isDatabaseConfigured()) return dbUnavailable();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const parsed = memberCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: firstZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const item = await Member.create({
      ...parsed.data,
      createdBy: session.email,
    });
    return NextResponse.json(
      { success: true, data: item.toObject() },
      { status: 201 }
    );
  } catch (error) {
    return serverError(error, '[POST /api/admin/members]');
  }
}
