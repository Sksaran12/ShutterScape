"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/constants";
import {
  AdminModal,
  AdminNotice,
  ConfirmDialog,
  EmptyPanel,
  Field,
  ImageDropzone,
  SaveButton,
  iconButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  statusPillClass,
} from "./AdminUi";
import { cn } from "@/lib/utils";
import {
  apiRequest,
  discardUpload,
  errorMessage,
  uploadImage,
  validateImageFile,
} from "./api";
import type { AdminGalleryRecord } from "./types";

interface GalleryForm {
  title: string;
  caption: string;
  altText: string;
  category: GalleryCategory;
  eventDate: string;
  published: boolean;
  imageUrl: string;
  imagePublicId: string;
}

const emptyForm: GalleryForm = {
  title: "",
  caption: "",
  altText: "",
  category: "Events & Workshops",
  eventDate: "",
  published: true,
  imageUrl: "",
  imagePublicId: "",
};

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function GalleryManager() {
  const [items, setItems] = useState<AdminGalleryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminGalleryRecord | null>(null);
  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await apiRequest<AdminGalleryRecord[]>("/api/admin/gallery");
      setItems(payload.data);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function update<K extends keyof GalleryForm>(key: K, value: GalleryForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setPreview("");
    setFormError("");
    setShowForm(true);
  }

  function openEdit(item: AdminGalleryRecord) {
    setEditing(item);
    setForm({
      title: item.title,
      caption: item.caption,
      altText: item.altText,
      category: item.category,
      eventDate: item.eventDate ? item.eventDate.slice(0, 10) : "",
      published: item.published,
      imageUrl: item.imageUrl,
      imagePublicId: item.imagePublicId ?? "",
    });
    setFile(null);
    setPreview(item.imageUrl);
    setFormError("");
    setShowForm(true);
  }

  function applyFile(selected: File | null | undefined) {
    if (!selected) return;

    const validation = validateImageFile(selected);
    if (validation) {
      setFormError(validation);
      return;
    }

    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setFormError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.caption.trim() || !form.altText.trim()) {
      setFormError("Title, caption and alt text are required.");
      return;
    }
    if (!file && !form.imageUrl.trim()) {
      setFormError("Choose a photograph to upload, or provide an image URL.");
      return;
    }

    setSaving(true);
    let uploadedPublicId: string | null = null;

    try {
      let imageUrl = form.imageUrl.trim();
      let imagePublicId = form.imagePublicId;

      if (file) {
        const uploaded = await uploadImage(file, "shutterscape/gallery");
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
        uploadedPublicId = uploaded.publicId;
      }

      const body = JSON.stringify({
        title: form.title,
        caption: form.caption,
        altText: form.altText,
        category: form.category,
        eventDate: form.eventDate || undefined,
        published: form.published,
        imageUrl,
        imagePublicId: imagePublicId || undefined,
      });

      if (editing) {
        await apiRequest(`/api/admin/gallery/${editing._id}`, {
          method: "PUT",
          body,
        });
        setNotice("Gallery item updated.");
      } else {
        await apiRequest("/api/admin/gallery", { method: "POST", body });
        setNotice("Gallery item added.");
      }

      setShowForm(false);
      setEditing(null);
      setFile(null);
      setPreview("");
      await refresh();
    } catch (submitError) {
      if (uploadedPublicId) await discardUpload(uploadedPublicId);
      setFormError(errorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      const payload = await apiRequest<{ cleanup?: { ok: boolean } }>(
        `/api/admin/gallery/${deleteTarget._id}`,
        { method: "DELETE" }
      );
      setDeleteTarget(null);
      setNotice(
        payload.data?.cleanup && !payload.data.cleanup.ok
          ? "Item deleted. The Cloudinary image could not be removed automatically."
          : "Gallery item deleted."
      );
      await refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Gallery photographs
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            {items.length} item{items.length === 1 ? "" : "s"} · published items
            appear on the public gallery.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={primaryButtonClass}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add photograph
        </button>
      </div>

      <div className="space-y-2">
        {notice && <AdminNotice tone="success">{notice}</AdminNotice>}
        {error && <AdminNotice tone="error">{error}</AdminNotice>}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading gallery…
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyPanel
            title="No gallery items yet"
            message="Add the first photograph, or import the verified Club Details.pdf collection from the dashboard header."
            action={
              <button
                type="button"
                onClick={openCreate}
                className={primaryButtonClass}
              >
                Add photograph
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item._id}
              className="group relative overflow-hidden rounded-card border border-border bg-surface/70 shadow-editorial transition-all duration-500 ease-editorial hover:-translate-y-1 hover:border-forest/30 hover:shadow-hover"
            >
              <div className="relative h-40 overflow-hidden bg-background-tertiary">
                <SafeImage
                  src={item.imageUrl}
                  alt={item.altText}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-70"
                />
                <span
                  className={cn(
                    statusPillClass,
                    "absolute left-2 top-2 backdrop-blur-md",
                    item.published
                      ? "border-status-success/30 bg-status-success/15 text-status-success"
                      : "border-terracotta/30 bg-terracotta/15 text-terracotta"
                  )}
                >
                  {item.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="p-3.5">
                <p className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-forest">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                  {item.caption}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[10px] text-text-muted">
                  <span className="text-forest">{item.category}</span>
                  {formatDate(item.eventDate) && (
                    <span>· {formatDate(item.eventDate)}</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className={cn(secondaryButtonClass, "h-8 flex-1 px-2 py-0 text-[9px]")}
                  >
                    <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className={cn(
                      iconButtonClass,
                      "h-8 w-8 border-status-error/25 text-status-error hover:border-status-error/45 hover:bg-status-error/10 hover:text-status-error"
                    )}
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <AdminModal
          title={editing ? "Edit photograph" : "Add photograph"}
          description="Upload an original club photograph. The image is stored in Cloudinary and its metadata in MongoDB."
          onClose={() => {
            if (saving) return;
            setShowForm(false);
            setEditing(null);
            setFile(null);
            setPreview("");
            setFormError("");
          }}
          wide
          footer={
            <>
              <SaveButton
                saving={saving}
                form="gallery-form"
                label={editing ? "Save changes" : "Add photograph"}
              />
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={saving}
                className={cn("flex-1", secondaryButtonClass)}
              >
                Cancel
              </button>
            </>
          }
        >
          <form id="gallery-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                Photograph
              </p>
              <ImageDropzone
                id="gallery-image-file"
                preview={preview}
                alt="Selected photograph preview"
                label="Upload a photograph"
                hint="Click to browse or drag an image here · JPEG, PNG or WebP, up to 15 MB"
                onFile={applyFile}
                fit="cover"
                className="h-52 w-full sm:h-56"
              />
            </div>

            <Field label="Or paste an image URL" htmlFor="gallery-image-url" hint="Use this for an existing Cloudinary image. Local /assets paths are also accepted.">
              <input
                id="gallery-image-url"
                type="text"
                value={form.imageUrl}
                onChange={(event) => update("imageUrl", event.target.value)}
                placeholder="/assets/photos/example.jpg or https://res.cloudinary.com/…"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="gallery-title" required>
                <input
                  id="gallery-title"
                  type="text"
                  required
                  maxLength={160}
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  className={inputClass}
                  placeholder="e.g. World Photography Day Exhibition 2026"
                />
              </Field>
              <Field label="Category" htmlFor="gallery-category" required>
                <select
                  id="gallery-category"
                  value={form.category}
                  onChange={(event) =>
                    update("category", event.target.value as GalleryCategory)
                  }
                  className={inputClass}
                >
                  {GALLERY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Caption" htmlFor="gallery-caption" required>
              <textarea
                id="gallery-caption"
                required
                maxLength={600}
                rows={3}
                value={form.caption}
                onChange={(event) => update("caption", event.target.value)}
                className={inputClass}
                placeholder="Describe what is actually visible in the photograph."
              />
            </Field>

            <Field
              label="Alt text"
              htmlFor="gallery-alt"
              required
              hint="A concise description for screen readers. Do not repeat the title word for word."
            >
              <input
                id="gallery-alt"
                type="text"
                required
                maxLength={300}
                value={form.altText}
                onChange={(event) => update("altText", event.target.value)}
                className={inputClass}
                placeholder="e.g. Students viewing prints on an exhibition wall"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Verified event date (optional)"
                htmlFor="gallery-date"
                hint="Leave blank if the exact date is not documented."
              >
                <input
                  id="gallery-date"
                  type="date"
                  value={form.eventDate}
                  onChange={(event) => update("eventDate", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => update("published", event.target.checked)}
                  className="h-4 w-4 rounded border-border text-forest focus:ring-forest"
                />
                Published (visible publicly)
              </label>
            </div>

            {formError && <AdminNotice tone="error">{formError}</AdminNotice>}
          </form>
        </AdminModal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this gallery item?"
          message={`“${deleteTarget.title}” will be removed from the public gallery. If Cloudinary is configured, its uploaded image is deleted too.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
