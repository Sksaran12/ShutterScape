import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConfigured } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { dbUnavailable, serverError, unauthorized } from '@/lib/http';
import GalleryItem from '@/models/GalleryItem';
import Activity from '@/models/Activity';
import Member from '@/models/Member';
import { seedActivities, seedGallery, seedMembers } from '@/lib/seed-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Seed records use stable string ids; MongoDB records use its own ObjectId. */
function withoutSeedId<T extends { id: string }>(item: T): Omit<T, 'id'> {
  const copy = { ...item };
  delete (copy as Partial<T>).id;
  return copy as Omit<T, 'id'>;
}

/**
 * Imports the verified Club Details.pdf content into an empty database.
 * Existing collections are never overwritten, so this is safe to retry.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  if (!isDatabaseConfigured()) return dbUnavailable();

  try {
    await connectToDatabase();

    const [galleryCount, activityCount, memberCount] = await Promise.all([
      GalleryItem.estimatedDocumentCount(),
      Activity.estimatedDocumentCount(),
      Member.estimatedDocumentCount(),
    ]);

    let galleryInserted = 0;
    let activitiesInserted = 0;
    let membersInserted = 0;

    if (galleryCount === 0) {
      const created = await GalleryItem.insertMany(
        seedGallery.map((item) => ({
          ...withoutSeedId(item),
          createdBy: `seed:${session.email}`,
        }))
      );
      galleryInserted = created.length;
    }

    if (activityCount === 0) {
      const created = await Activity.insertMany(
        seedActivities.map((item) => ({
          ...withoutSeedId(item),
          createdBy: `seed:${session.email}`,
        }))
      );
      activitiesInserted = created.length;
    }

    if (memberCount === 0) {
      const created = await Member.insertMany(
        seedMembers.map((item) => ({
          ...withoutSeedId(item),
          createdBy: `seed:${session.email}`,
        }))
      );
      membersInserted = created.length;
    }

    return NextResponse.json({
      success: true,
      message: 'Verified starter content prepared.',
      data: { galleryInserted, activitiesInserted, membersInserted },
    });
  } catch (error) {
    return serverError(error, '[POST /api/admin/seed]');
  }
}
