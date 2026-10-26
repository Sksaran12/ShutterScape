import { connectToDatabase } from "./db";
import GalleryItem from "@/models/GalleryItem";
import Activity from "@/models/Activity";
import Member from "@/models/Member";
import type {
  ActivityRecord,
  ContentResult,
  GalleryRecord,
  MemberRecord,
} from "./content-types";
import { seedActivities, seedGallery, seedMembers } from "./seed-data";
import type { MemberCategory } from "./constants";

function hasDatabase() {
  return Boolean(process.env.MONGODB_URI);
}

function mapGallery(doc: Record<string, unknown>): GalleryRecord {
  return {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    caption: String(doc.caption ?? ""),
    imageUrl: String(doc.imageUrl ?? ""),
    thumbnailUrl: doc.thumbnailUrl ? String(doc.thumbnailUrl) : undefined,
    altText: String(doc.altText ?? ""),
    category: doc.category as GalleryRecord["category"],
    eventDate: doc.eventDate
      ? new Date(doc.eventDate as string).toISOString()
      : undefined,
    published: Boolean(doc.published),
  };
}

function mapActivity(doc: Record<string, unknown>): ActivityRecord {
  return {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    coverImageUrl: doc.coverImageUrl
      ? String(doc.coverImageUrl)
      : undefined,
    activityDate: doc.activityDate
      ? new Date(doc.activityDate as string).toISOString()
      : undefined,
    endDate: doc.endDate
      ? new Date(doc.endDate as string).toISOString()
      : undefined,
    dateLabel: doc.dateLabel ? String(doc.dateLabel) : undefined,
    published: Boolean(doc.published),
  };
}

function mapMember(doc: Record<string, unknown>): MemberRecord {
  return {
    id: String(doc._id),
    fullName: String(doc.fullName ?? ""),
    role: String(doc.role ?? ""),
    memberCategory: doc.memberCategory as MemberCategory,
    department: doc.department ? String(doc.department) : undefined,
    biography: doc.biography ? String(doc.biography) : undefined,
    portraitUrl: doc.portraitUrl ? String(doc.portraitUrl) : undefined,
    altText: String(doc.altText ?? ""),
    displayOrder: Number(doc.displayOrder ?? 0),
    published: Boolean(doc.published),
  };
}

export async function getGallery(): Promise<ContentResult<GalleryRecord>> {
  if (!hasDatabase()) {
    return { items: seedGallery, source: "fallback" };
  }

  try {
    await connectToDatabase();
    const docs = await GalleryItem.find({ published: true })
      .sort({ eventDate: -1, createdAt: -1 })
      .lean();
    return {
      items: docs.map((doc) =>
        mapGallery(doc as unknown as Record<string, unknown>)
      ),
      source: "database",
    };
  } catch (error) {
    console.error("[content] gallery fallback:", error);
    return { items: seedGallery, source: "fallback" };
  }
}

export async function getActivities(): Promise<
  ContentResult<ActivityRecord>
> {
  if (!hasDatabase()) {
    return { items: seedActivities, source: "fallback" };
  }

  try {
    await connectToDatabase();
    const docs = await Activity.find({ published: true })
      .sort({ activityDate: -1 })
      .lean();
    return {
      items: docs.map((doc) =>
        mapActivity(doc as unknown as Record<string, unknown>)
      ),
      source: "database",
    };
  } catch (error) {
    console.error("[content] activities fallback:", error);
    return { items: seedActivities, source: "fallback" };
  }
}

export async function getMembers(
  category?: MemberCategory
): Promise<ContentResult<MemberRecord>> {
  const fallback = category
    ? seedMembers.filter((member) => member.memberCategory === category)
    : seedMembers;

  if (!hasDatabase()) {
    return { items: fallback, source: "fallback" };
  }

  try {
    await connectToDatabase();
    const docs = await Member.find({
      published: true,
      ...(category ? { memberCategory: category } : {}),
    })
      .sort({ memberCategory: 1, displayOrder: 1 })
      .lean();
    return {
      items: docs.map((doc) =>
        mapMember(doc as unknown as Record<string, unknown>)
      ),
      source: "database",
    };
  } catch (error) {
    console.error("[content] members fallback:", error);
    return { items: fallback, source: "fallback" };
  }
}

export function groupMembersByCategory(members: MemberRecord[]) {
  return {
    faculty: members
      .filter((member) => member.memberCategory === "faculty")
      .sort((a, b) => a.displayOrder - b.displayOrder),
    leadership: members
      .filter((member) => member.memberCategory === "leadership")
      .sort((a, b) => a.displayOrder - b.displayOrder),
    core: members
      .filter((member) => member.memberCategory === "core")
      .sort((a, b) => a.displayOrder - b.displayOrder),
    alumni: members
      .filter((member) => member.memberCategory === "alumni")
      .sort((a, b) => a.displayOrder - b.displayOrder),
  };
}
