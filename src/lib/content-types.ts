import type { GalleryCategory, MemberCategory } from "./constants";

export interface GalleryRecord {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  thumbnailUrl?: string;
  altText: string;
  category: GalleryCategory;
  eventDate?: string;
  published: boolean;
}

export interface ActivityRecord {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  activityDate?: string;
  endDate?: string;
  dateLabel?: string;
  published: boolean;
}

export interface MemberRecord {
  id: string;
  fullName: string;
  role: string;
  memberCategory: MemberCategory;
  department?: string;
  biography?: string;
  portraitUrl?: string;
  altText: string;
  displayOrder: number;
  published: boolean;
}

export interface ContentResult<T> {
  items: T[];
  source: "database" | "fallback";
}
