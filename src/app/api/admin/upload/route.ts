import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getClientKey, rateLimit } from '@/lib/rate-limit';
import { unauthorized, tooManyRequests, serverError } from '@/lib/http';
import {
  destroyCloudinaryAsset,
  isCloudinaryConfigured,
  uploadImageToCloudinary,
} from '@/lib/cloudinary';
import {
  ALLOWED_IMAGE_TYPES,
  CLOUDINARY_FOLDER,
  MAX_UPLOAD_BYTES,
} from '@/lib/constants';
import { cloudinaryPublicIdSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hasValidImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const isJpeg =
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isWebp =
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';
  return isJpeg || isPng || isWebp;
}

/** Server-proxied Cloudinary upload. The API secret stays on the server. */
export async function POST(request: Request) {
  if (!(await getAdminSession())) return unauthorized();

  const limit = rateLimit(getClientKey(request, 'admin-upload'), 20, 60_000);
  if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Image uploads are unavailable until Cloudinary credentials are configured on the server.',
      },
      { status: 503 }
    );
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return NextResponse.json(
      { success: false, message: 'Expected a multipart form upload.' },
      { status: 415 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Could not read the uploaded file.' },
      { status: 400 }
    );
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: 'No file was provided.' },
      { status: 400 }
    );
  }

  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { success: false, message: 'Only JPEG, PNG or WebP images are allowed.' },
      { status: 415 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { success: false, message: 'The uploaded file is empty.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        success: false,
        message: `Images must be smaller than ${Math.round(
          MAX_UPLOAD_BYTES / 1024 / 1024
        )} MB.`,
      },
      { status: 413 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageSignature(buffer)) {
      return NextResponse.json(
        {
          success: false,
          message: 'The file contents are not a valid JPEG, PNG or WebP image.',
        },
        { status: 415 }
      );
    }

    const folderValue = form.get('folder');
    const folder =
      typeof folderValue === 'string' &&
      /^[a-zA-Z0-9/_-]{1,100}$/.test(folderValue)
        ? folderValue
        : CLOUDINARY_FOLDER;

    const uploadFile = new File([buffer], file.name || 'upload', {
      type: file.type,
    });
    const result = await uploadImageToCloudinary(uploadFile, folder);

    return NextResponse.json({
      success: true,
      data: {
        url: result.secureUrl,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    return serverError(error, '[POST /api/admin/upload]');
  }
}

/** Delete an uploaded asset that is no longer referenced. */
export async function DELETE(request: Request) {
  if (!(await getAdminSession())) return unauthorized();

  const limit = rateLimit(getClientKey(request, 'admin-upload'), 20, 60_000);
  if (!limit.success) return tooManyRequests(limit.retryAfterSeconds);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const publicId =
    payload && typeof payload === 'object' && 'publicId' in payload
      ? (payload as { publicId?: unknown }).publicId
      : undefined;

  const parsed = cloudinaryPublicIdSchema.safeParse(publicId);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: 'A valid Cloudinary public ID is required.' },
      { status: 400 }
    );
  }

  const result = await destroyCloudinaryAsset(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, message: result.message || 'Could not remove the image.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, message: 'Image removed.' });
}
