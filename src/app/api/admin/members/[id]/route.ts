import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConfigured } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { getClientKey, rateLimit } from '@/lib/rate-limit';
import {
  dbUnavailable,
  notFound,
  serverError,
  tooManyRequests,
  unauthorized,
} from '@/lib/http';
import Member from '@/models/Member';
import { destroyCloudinaryAsset } from '@/lib/cloudinary';
import {
  firstZodError,
  memberUpdateSchema,
  objectIdSchema,
} from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await getAdminSession())) return unauthorized();

  const id = objectIdSchema.safeParse(params.id);
  if (!id.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid identifier.' },
      { status: 400 }
    );
  }

  if (!isDatabaseConfigured()) return dbUnavailable();

  try {
    await connectToDatabase();
    const item = await Member.findById(id.data).lean();
    if (!item) return notFound();
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return serverError(error, '[GET /api/admin/members/:id]');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await getAdminSession())) return unauthorized();

  const limit = rateLimit(getClientKey(request, 'admin-write'), 60, 60_000);
  if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

  const id = objectIdSchema.safeParse(params.id);
  if (!id.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid identifier.' },
      { status: 400 }
    );
  }

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

  const parsed = memberUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: firstZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const item = await Member.findById(id.data);
    if (!item) return notFound();

    const previousPublicId = item.portraitPublicId;
    Object.assign(item, parsed.data);
    await item.save();

    if (
      previousPublicId &&
      parsed.data.portraitPublicId &&
      previousPublicId !== parsed.data.portraitPublicId
    ) {
      await destroyCloudinaryAsset(previousPublicId);
    }

    return NextResponse.json({ success: true, data: item.toObject() });
  } catch (error) {
    return serverError(error, '[PUT /api/admin/members/:id]');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await getAdminSession())) return unauthorized();

  const limit = rateLimit(getClientKey(request, 'admin-write'), 60, 60_000);
  if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

  const id = objectIdSchema.safeParse(params.id);
  if (!id.success) {
    return NextResponse.json(
      { success: false, message: 'Invalid identifier.' },
      { status: 400 }
    );
  }

  if (!isDatabaseConfigured()) return dbUnavailable();

  try {
    await connectToDatabase();
    const item = await Member.findById(id.data);
    if (!item) return notFound();

    const publicId = item.portraitPublicId;
    await item.deleteOne();

    let cleanup: { ok: boolean; message?: string } | null = null;
    if (publicId) cleanup = await destroyCloudinaryAsset(publicId);

    return NextResponse.json({
      success: true,
      message: 'Member deleted.',
      data: { cleanup },
    });
  } catch (error) {
    return serverError(error, '[DELETE /api/admin/members/:id]');
  }
}
