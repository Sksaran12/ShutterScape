import { NextResponse } from 'next/server';
import { getMembers } from '@/lib/content';
import {
  firstZodError,
  membersQuerySchema,
  searchParamsObject,
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** Public members endpoint. Read-only, published items only. */
export async function GET(request: Request) {
  const parsed = membersQuerySchema.safeParse(searchParamsObject(request.url));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: firstZodError(parsed.error) },
      { status: 400 }
    );
  }

  const { items, source } = await getMembers(parsed.data.category);

  return NextResponse.json({
    success: true,
    data: items,
    meta: { source, total: items.length },
  });
}
