import crypto from 'crypto';

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

function getConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured(): boolean {
  return getConfig() !== null;
}

/**
 * Cloudinary signs the alphabetically sorted request parameters with SHA-1
 * (the default algorithm). `file`, `api_key`, `resource_type` and
 * `cloud_name` are never part of the signature.
 */
export function signCloudinaryParams(
  params: Record<string, string>,
  apiSecret: string
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Uploads the file from the server. The API secret and signature never reach
 * the browser; the admin client only receives the resulting secure URL.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string
): Promise<CloudinaryUploadResult> {
  const config = getConfig();
  if (!config) {
    throw new Error('Cloudinary is not configured on the server.');
  }

  const timestamp = String(Math.round(Date.now() / 1000));
  const params = { folder, timestamp };
  const signature = signCloudinaryParams(params, config.apiSecret);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', config.apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    { method: 'POST', body: form }
  );

  const payload = (await response.json().catch(() => null)) as
    | {
        secure_url?: string;
        url?: string;
        public_id?: string;
        width?: number;
        height?: number;
        format?: string;
        bytes?: number;
        error?: { message?: string };
      }
    | null;

  if (!response.ok || !payload?.secure_url || !payload.public_id) {
    throw new Error(
      payload?.error?.message || 'Cloudinary rejected the upload.'
    );
  }

  return {
    url: payload.url || payload.secure_url,
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width ?? 0,
    height: payload.height ?? 0,
    format: payload.format ?? '',
    bytes: payload.bytes ?? 0,
  };
}

/**
 * Removes an asset after its database record has been deleted. Failures are
 * reported but never resurrect a deleted record.
 */
export async function destroyCloudinaryAsset(
  publicId: string
): Promise<{ ok: boolean; message?: string }> {
  const config = getConfig();
  if (!config) {
    return { ok: false, message: 'Cloudinary is not configured on the server.' };
  }

  const timestamp = String(Math.round(Date.now() / 1000));
  const signature = signCloudinaryParams(
    { public_id: publicId, timestamp },
    config.apiSecret
  );

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: config.apiKey,
    timestamp,
    signature,
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }
    );
    const payload = (await response.json().catch(() => null)) as
      | { result?: string; error?: { message?: string } }
      | null;
    if (!response.ok) {
      return {
        ok: false,
        message: payload?.error?.message || 'Cloudinary delete failed.',
      };
    }
    return { ok: payload?.result === 'ok' || payload?.result === 'not found' };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : 'Cloudinary delete failed.',
    };
  }
}
