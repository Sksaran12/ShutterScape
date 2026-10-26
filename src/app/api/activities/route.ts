import { NextResponse } from 'next/server';
import { getActivities } from '@/lib/content';
import {
  activitiesQuerySchema,
  firstZodError,
  searchParamsObject,
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** Public activities endpoint. Read-only, published items only. */
export async function GET(request: Request) {
  const parsed = activitiesQuerySchema.safeParse(
    searchParamsObject(request.url)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: firstZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { page, limit } = parsed.data;
  const { items, source } = await getActivities();
  const total = items.length;
  const start = (page - 1) * limit;

  return NextResponse.json({
    success: true,
    data: items.slice(start, start + limit),
    meta: {
      source,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}
