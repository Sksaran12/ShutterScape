import type { ApiPayload, UploadedImage } from "./types";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Fetch wrapper for the admin API. On an expired/invalid session it sends the
 * user to the login page instead of leaving buttons silently failing.
 */
export async function apiRequest<T>(
  url: string,
  init: RequestInit = {}
): Promise<ApiPayload<T>> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | (ApiPayload<T> & { data?: T })
    | null;

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.assign("/admin/login");
    }
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message || "The request could not be completed.",
      response.status
    );
  }

  return payload as ApiPayload<T>;
}

export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Choose a JPEG, PNG or WebP image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `The image must be smaller than ${Math.round(
      MAX_UPLOAD_BYTES / 1024 / 1024
    )} MB.`;
  }
  return null;
}

export async function uploadImage(
  file: File,
  folder: string
): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const payload = await apiRequest<UploadedImage>("/api/admin/upload", {
    method: "POST",
    body: form,
  });
  return payload.data;
}

export async function discardUpload(publicId: string): Promise<void> {
  try {
    await apiRequest("/api/admin/upload", {
      method: "DELETE",
      body: JSON.stringify({ publicId }),
    });
  } catch {
    // Best-effort cleanup; the original error is more useful to the admin.
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
