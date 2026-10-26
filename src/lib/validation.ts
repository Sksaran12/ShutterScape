import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import type { ZodError } from 'zod';

export const GALLERY_CATEGORIES = [
  'Campus Life',
  'Events & Workshops',
  'Photowalks',
  'Behind the Lens',
] as const;

export const MEMBER_CATEGORIES = [
  'faculty',
  'leadership',
  'core',
  'alumni',
] as const;

/** Strip markup and collapse whitespace for plain-text fields. */
export function cleanText(value: string): string {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Sanitize rich-text descriptions before they are stored or rendered. */
export function cleanRichText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'ul',
      'ol',
      'li',
      'blockquote',
      'h3',
      'h4',
      'a',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    },
  }).trim();
}

const plainText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} is too long.`)
    .transform(cleanText)
    .refine((value) => value.length > 0, `${label} is required.`);

const optionalPlainText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long.`)
    .transform(cleanText)
    .optional();

function isAllowedImageUrl(value: string): boolean {
  return (
    value.startsWith('/') ||
    /^https:\/\/res\.cloudinary\.com\/[^\s]+$/i.test(value)
  );
}

const imageLocation = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(2048, `${label} is too long.`)
    .refine(
      isAllowedImageUrl,
      `${label} must be a local /assets path or a res.cloudinary.com URL.`
    );

const optionalImageLocation = (label: string) =>
  z
    .string()
    .trim()
    .max(2048, `${label} is too long.`)
    .refine(
      (value) => value === '' || isAllowedImageUrl(value),
      `${label} must be a local /assets path or a res.cloudinary.com URL.`
    )
    .optional();

const optionalDate = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.date().optional()
);

export const galleryCreateSchema = z.object({
  title: plainText(160, 'Title'),
  caption: plainText(600, 'Caption'),
  imageUrl: imageLocation('Image URL'),
  imagePublicId: optionalPlainText(300, 'Image public ID'),
  thumbnailUrl: optionalImageLocation('Thumbnail URL'),
  altText: plainText(300, 'Alt text'),
  category: z.enum(GALLERY_CATEGORIES, {
    message: 'Choose a valid gallery category.',
  }),
  eventDate: optionalDate,
  published: z.boolean().optional().default(true),
});

export const galleryUpdateSchema = galleryCreateSchema.partial();

const activityBaseSchema = z.object({
  title: plainText(160, 'Title'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required.')
    .max(20000, 'Description is too long.')
    .transform(cleanRichText)
    .refine((value) => value.length > 0, 'Description is required.'),
  coverImageUrl: optionalImageLocation('Cover image URL'),
  coverImagePublicId: optionalPlainText(300, 'Cover image public ID'),
  activityDate: optionalDate,
  endDate: optionalDate,
  dateLabel: optionalPlainText(120, 'Date label'),
  published: z.boolean().optional().default(true),
});

export const activityCreateSchema = activityBaseSchema.refine(
  (data) => Boolean(data.activityDate || data.dateLabel),
  {
    message:
      'Provide the verified activity date, or a descriptive date label when no exact date is documented.',
    path: ['activityDate'],
  }
);

export const activityUpdateSchema = activityBaseSchema.partial();

export const memberCreateSchema = z.object({
  fullName: plainText(120, 'Full name'),
  role: plainText(120, 'Role'),
  memberCategory: z.enum(MEMBER_CATEGORIES, {
    message: 'Choose a valid member category.',
  }),
  department: optionalPlainText(200, 'Department'),
  biography: optionalPlainText(2000, 'Biography'),
  portraitUrl: optionalImageLocation('Portrait URL'),
  portraitPublicId: optionalPlainText(300, 'Portrait public ID'),
  altText: plainText(300, 'Alt text'),
  displayOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  published: z.boolean().optional().default(true),
});

export const memberUpdateSchema = memberCreateSchema.partial();

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.')
    .max(200),
  password: z
    .string()
    .min(1, 'Password is required.')
    .max(200, 'Password is too long.'),
});

export const galleryQuerySchema = z.object({
  category: z.enum(GALLERY_CATEGORIES).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(60),
});

export const activitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(60),
});

export const membersQuerySchema = z.object({
  category: z.enum(MEMBER_CATEGORIES).optional(),
});

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid identifier.');

export const cloudinaryPublicIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .regex(/^[A-Za-z0-9_\-/]+$/, 'Invalid Cloudinary public ID.');

export function firstZodError(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Invalid request.';
  if (issue.path.length === 0) return issue.message;
  return `${issue.path.join('.')}: ${issue.message}`;
}

export function searchParamsObject(url: string): Record<string, string | undefined> {
  const { searchParams } = new URL(url);
  return {
    category: searchParams.get('category') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  };
}
