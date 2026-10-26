import type { GalleryCategory, MemberCategory } from "@/lib/constants";

export interface AdminGalleryRecord {
  _id: string;
  title: string;
  caption: string;
  imageUrl: string;
  imagePublicId?: string;
  thumbnailUrl?: string;
  altText: string;
  category: GalleryCategory;
  eventDate?: string;
  published: boolean;
}

export interface AdminActivityRecord {
  _id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  activityDate?: string;
  endDate?: string;
  dateLabel?: string;
  published: boolean;
}

export interface AdminMemberRecord {
  _id: string;
  fullName: string;
  role: string;
  memberCategory: MemberCategory;
  department?: string;
  biography?: string;
  portraitUrl?: string;
  portraitPublicId?: string;
  altText: string;
  displayOrder: number;
  published: boolean;
}

export interface ApiPayload<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}
