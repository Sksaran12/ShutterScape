import { NextResponse } from 'next/server';
import { getGallery } from '@/lib/content';
import {
  firstZodError,
  galleryQuerySchema,
  searchParamsObject,
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * Public gallery endpoint. Read-only, published items only.
 * Query: ?category=Events%20%26%20Workshops&page=1&limit=24
 */
export async function GET(request: Request) {
  const parsed = galleryQuerySchema.safeParse(searchParamsObject(request.url));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: firstZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { category, page, limit } = parsed.data;
  const { items, source } = await getGallery();
  const filtered = category
    ? items.filter((item) => item.category === category)
    : items;

  const total = filtered.length;
  const start = (page - 1) * limit;

  return NextResponse.json({
    success: true,
    data: filtered.slice(start, start + limit),
    meta: {
      source,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}
