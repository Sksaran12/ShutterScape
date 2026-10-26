export const GALLERY_CATEGORIES = [
  "Campus Life",
  "Events & Workshops",
  "Photowalks",
  "Behind the Lens",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const MEMBER_CATEGORIES = [
  "faculty",
  "leadership",
  "core",
  "alumni",
] as const;

export type MemberCategory = (typeof MEMBER_CATEGORIES)[number];

export const MEMBER_CATEGORY_LABELS: Record<MemberCategory, string> = {
  faculty: "Faculty Coordinators",
  leadership: "Current Leadership",
  core: "Core Members",
  alumni: "Alumni & Previous Contributors",
};

export const CLUB = {
  name: "ShutterScape",
  university: "Girijananda Choudhury University",
  foundedYear: 2023,
  whatsapp:
    "https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4",
  instagram: "https://www.instagram.com/shutterscape_gcu",
  map: "https://www.google.com/maps/search/?api=1&query=Girijananda+Choudhury+University+Azara+Guwahati",
  address:
    "Girijananda Choudhury University, Hatkhowapara, Azara, Guwahati, Assam 781017",
  maintainer: "Codénix (GCU Coding Club)",
} as const;

export const CLOUDINARY_FOLDER = "shutterscape";

/**
 * Maximum upload size in MB.
 *
 * Defaults to 15. Vercel caps serverless function request bodies at 4.5 MB,
 * so production deployments there should set NEXT_PUBLIC_MAX_UPLOAD_MB=4.
 * The value is `NEXT_PUBLIC_` because the admin UI validates the file size
 * in the browser before sending it to the upload route.
 */
const configuredUploadMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB);
export const MAX_UPLOAD_MB =
  Number.isFinite(configuredUploadMb) && configuredUploadMb > 0
    ? configuredUploadMb
    : 15;

export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
