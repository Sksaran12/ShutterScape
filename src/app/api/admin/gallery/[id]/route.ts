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
import GalleryItem from '@/models/GalleryItem';
import { destroyCloudinaryAsset } from '@/lib/cloudinary';
import {
  firstZodError,
  galleryUpdateSchema,
  objectIdSchema,
} from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

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
    const item = await GalleryItem.findById(id.data).lean();
    if (!item) return notFound();
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return serverError(error, '[GET /api/admin/gallery/:id]');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

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

  const parsed = galleryUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: firstZodError(parsed.error) },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const item = await GalleryItem.findById(id.data);
    if (!item) return notFound();

    const previousPublicId = item.imagePublicId;
    Object.assign(item, parsed.data);
    await item.save();

    if (
      previousPublicId &&
      parsed.data.imagePublicId &&
      previousPublicId !== parsed.data.imagePublicId
    ) {
      await destroyCloudinaryAsset(previousPublicId);
    }

    return NextResponse.json({ success: true, data: item.toObject() });
  } catch (error) {
    return serverError(error, '[PUT /api/admin/gallery/:id]');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

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
    const item = await GalleryItem.findById(id.data);
    if (!item) return notFound();

    const publicId = item.imagePublicId;
    await item.deleteOne();

    let cleanup: { ok: boolean; message?: string } | null = null;
    if (publicId) {
      cleanup = await destroyCloudinaryAsset(publicId);
    }

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted.',
      data: { cleanup },
    });
  } catch (error) {
    return serverError(error, '[DELETE /api/admin/gallery/:id]');
  }
}
