"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarDays, Edit2, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
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
import type { AdminActivityRecord } from "./types";

interface ActivityForm {
  title: string;
  description: string;
  coverImageUrl: string;
  coverImagePublicId: string;
  activityDate: string;
  endDate: string;
  dateLabel: string;
  published: boolean;
}

const emptyForm: ActivityForm = {
  title: "",
  description: "",
  coverImageUrl: "",
  coverImagePublicId: "",
  activityDate: "",
  endDate: "",
  dateLabel: "",
  published: true,
};

function labelFor(activity: AdminActivityRecord) {
  if (activity.activityDate) {
    const date = new Date(activity.activityDate);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
    }
  }
  return activity.dateLabel || "No date recorded";
}

export default function ActivitiesManager() {
  const [items, setItems] = useState<AdminActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminActivityRecord | null>(null);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminActivityRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await apiRequest<AdminActivityRecord[]>(
        "/api/admin/activities"
      );
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

  function update<K extends keyof ActivityForm>(
    key: K,
    value: ActivityForm[K]
  ) {
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

  function openEdit(item: AdminActivityRecord) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      coverImageUrl: item.coverImageUrl ?? "",
      coverImagePublicId: item.coverImagePublicId ?? "",
      activityDate: item.activityDate ? item.activityDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
      dateLabel: item.dateLabel ?? "",
      published: item.published,
    });
    setFile(null);
    setPreview(item.coverImageUrl ?? "");
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

    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    if (!form.activityDate && !form.dateLabel.trim()) {
      setFormError(
        "Provide the verified activity date, or a date label if the exact date is not documented."
      );
      return;
    }

    setSaving(true);
    let uploadedPublicId: string | null = null;

    try {
      let coverImageUrl = form.coverImageUrl.trim();
      let coverImagePublicId = form.coverImagePublicId;

      if (file) {
        const uploaded = await uploadImage(file, "shutterscape/activities");
        coverImageUrl = uploaded.url;
        coverImagePublicId = uploaded.publicId;
        uploadedPublicId = uploaded.publicId;
      }

      const body = JSON.stringify({
        title: form.title,
        description: form.description,
        coverImageUrl: coverImageUrl || undefined,
        coverImagePublicId: coverImagePublicId || undefined,
        activityDate: form.activityDate || undefined,
        endDate: form.endDate || undefined,
        dateLabel: form.dateLabel || undefined,
        published: form.published,
      });

      if (editing) {
        await apiRequest(`/api/admin/activities/${editing._id}`, {
          method: "PUT",
          body,
        });
        setNotice("Activity updated.");
      } else {
        await apiRequest("/api/admin/activities", { method: "POST", body });
        setNotice("Activity added.");
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
        `/api/admin/activities/${deleteTarget._id}`,
        { method: "DELETE" }
      );
      setDeleteTarget(null);
      setNotice(
        payload.data?.cleanup && !payload.data.cleanup.ok
          ? "Activity deleted. The Cloudinary cover could not be removed automatically."
          : "Activity deleted."
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
          <h2 className="font-display text-xl font-semibold text-text-primary">Activities</h2>
          <p className="mt-1 text-xs text-text-secondary">
            {items.length} item{items.length === 1 ? "" : "s"} · displayed newest
            first on the public timeline.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={primaryButtonClass}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add activity
        </button>
      </div>

      <div className="space-y-2">
        {notice && <AdminNotice tone="success">{notice}</AdminNotice>}
        {error && <AdminNotice tone="error">{error}</AdminNotice>}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading activities…
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EmptyPanel
            title="No activities yet"
            message="Add an activity, or import the verified Club Details.pdf collection from the dashboard header."
            action={
              <button
                type="button"
                onClick={openCreate}
                className={primaryButtonClass}
              >
                Add activity
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item._id}
              className="group flex flex-col gap-4 rounded-card border border-border bg-surface/70 p-3.5 shadow-editorial transition-all duration-500 ease-editorial hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-hover sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-background-tertiary ring-1 ring-inset ring-white/[0.06] sm:h-20 sm:w-32">
                {item.coverImageUrl ? (
                  <SafeImage
                    src={item.coverImageUrl}
                    alt={item.title}
                    fill
                    sizes="128px"
                    className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImagePlus className="h-5 w-5 text-text-muted" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      statusPillClass,
                      item.published
                        ? "border-status-success/30 bg-status-success/10 text-status-success"
                        : "border-terracotta/30 bg-terracotta/10 text-terracotta"
                    )}
                  >
                    {item.published ? "Published" : "Draft"}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {labelFor(item)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-forest">
                  {item.title}
                </p>
              </div>

              <div className="flex gap-2 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className={cn(secondaryButtonClass, "h-8 px-3 py-0 text-[9px]")}
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
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <AdminModal
          title={editing ? "Edit activity" : "Add activity"}
          description="Published activities appear on the Activities page and in the homepage preview."
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
                form="activity-form"
                label={editing ? "Save changes" : "Add activity"}
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
          <form id="activity-form" onSubmit={handleSubmit} className="space-y-4">
            <Field label="Title" htmlFor="activity-title" required>
              <input
                id="activity-title"
                type="text"
                required
                maxLength={160}
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Description"
              htmlFor="activity-description"
              required
              hint="Basic HTML is allowed and sanitized on the server: <p>, <strong>, <em>, <ul>, <ol>, <li>, <a>."
            >
              <textarea
                id="activity-description"
                required
                rows={6}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                className={`${inputClass} font-mono text-xs`}
                placeholder="<p>Describe the activity…</p>"
              />
            </Field>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                Cover image (optional)
              </p>
              <ImageDropzone
                id="activity-cover-file"
                preview={preview}
                alt="Activity cover preview"
                label="Upload a cover image"
                hint="Click to browse or drag an image here · JPEG, PNG or WebP, up to 15 MB"
                onFile={applyFile}
                fit="cover"
                className="h-52 w-full sm:h-56"
              />
            </div>

            <Field label="Or paste a cover URL" htmlFor="activity-cover-url">
              <input
                id="activity-cover-url"
                type="text"
                value={form.coverImageUrl}
                onChange={(event) =>
                  update("coverImageUrl", event.target.value)
                }
                placeholder="/assets/photos/example.jpg or https://res.cloudinary.com/…"
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Activity date"
                htmlFor="activity-date"
                hint="Only use a date documented in the source material."
              >
                <input
                  id="activity-date"
                  type="date"
                  value={form.activityDate}
                  onChange={(event) =>
                    update("activityDate", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="End date (optional)" htmlFor="activity-end">
                <input
                  id="activity-end"
                  type="date"
                  value={form.endDate}
                  onChange={(event) => update("endDate", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Date label"
                htmlFor="activity-label"
                hint="Use when the exact date is not documented."
              >
                <input
                  id="activity-label"
                  type="text"
                  maxLength={120}
                  value={form.dateLabel}
                  onChange={(event) => update("dateLabel", event.target.value)}
                  className={inputClass}
                  placeholder="e.g. Euphuism 2026"
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => update("published", event.target.checked)}
                className="h-4 w-4 rounded border-border text-forest focus:ring-forest"
              />
              Published (visible publicly)
            </label>

            {formError && <AdminNotice tone="error">{formError}</AdminNotice>}
          </form>
        </AdminModal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this activity?"
          message={`“${deleteTarget.title}” will be removed from the Activities page and homepage.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
