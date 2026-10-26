"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Trash2, UserRound } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  MEMBER_CATEGORIES,
  MEMBER_CATEGORY_LABELS,
  type MemberCategory,
} from "@/lib/constants";
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
} from "./AdminUi";
import { cn } from "@/lib/utils";
import {
  apiRequest,
  discardUpload,
  errorMessage,
  uploadImage,
  validateImageFile,
} from "./api";
import type { AdminMemberRecord } from "./types";

interface MemberForm {
  fullName: string;
  role: string;
  memberCategory: MemberCategory;
  department: string;
  biography: string;
  portraitUrl: string;
  portraitPublicId: string;
  altText: string;
  displayOrder: number;
  published: boolean;
}

const emptyForm: MemberForm = {
  fullName: "",
  role: "",
  memberCategory: "core",
  department: "",
  biography: "",
  portraitUrl: "",
  portraitPublicId: "",
  altText: "",
  displayOrder: 0,
  published: true,
};

export default function MembersManager() {
  const [items, setItems] = useState<AdminMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"all" | MemberCategory>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminMemberRecord | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminMemberRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await apiRequest<AdminMemberRecord[]>("/api/admin/members");
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

  function update<K extends keyof MemberForm>(key: K, value: MemberForm[K]) {
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

  function openEdit(item: AdminMemberRecord) {
    setEditing(item);
    setForm({
      fullName: item.fullName,
      role: item.role,
      memberCategory: item.memberCategory,
      department: item.department ?? "",
      biography: item.biography ?? "",
      portraitUrl: item.portraitUrl ?? "",
      portraitPublicId: item.portraitPublicId ?? "",
      altText: item.altText,
      displayOrder: item.displayOrder,
      published: item.published,
    });
    setFile(null);
    setPreview(item.portraitUrl ?? "");
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

    if (!form.fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!form.role.trim()) {
      setFormError("Role is required. Use the documented role or the member category.");
      return;
    }

    setSaving(true);
    let uploadedPublicId: string | null = null;

    try {
      let portraitUrl = form.portraitUrl.trim();
      let portraitPublicId = form.portraitPublicId;

      if (file) {
        const uploaded = await uploadImage(file, "shutterscape/members");
        portraitUrl = uploaded.url;
        portraitPublicId = uploaded.publicId;
        uploadedPublicId = uploaded.publicId;
      }

      const body = JSON.stringify({
        fullName: form.fullName,
        role: form.role,
        memberCategory: form.memberCategory,
        department: form.department || undefined,
        biography: form.biography || undefined,
        portraitUrl: portraitUrl || undefined,
        portraitPublicId: portraitPublicId || undefined,
        altText: form.altText.trim() || `Portrait of ${form.fullName.trim()}`,
        displayOrder: Number(form.displayOrder) || 0,
        published: form.published,
      });

      if (editing) {
        await apiRequest(`/api/admin/members/${editing._id}`, {
          method: "PUT",
          body,
        });
        setNotice("Member updated.");
      } else {
        await apiRequest("/api/admin/members", { method: "POST", body });
        setNotice("Member added.");
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
        `/api/admin/members/${deleteTarget._id}`,
        { method: "DELETE" }
      );
      setDeleteTarget(null);
      setNotice(
        payload.data?.cleanup && !payload.data.cleanup.ok
          ? "Member deleted. The Cloudinary portrait could not be removed automatically."
          : "Member deleted."
      );
      await refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  }

  const visible =
    filter === "all"
      ? items
      : items.filter((item) => item.memberCategory === filter);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-text-primary">
            Faculty and members
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            {items.length} record{items.length === 1 ? "" : "s"} · faculty,
            leadership, core members and alumni.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={primaryButtonClass}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add member
        </button>
      </div>

      <div className="space-y-2">
        {notice && <AdminNotice tone="success">{notice}</AdminNotice>}
        {error && <AdminNotice tone="error">{error}</AdminNotice>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", ...MEMBER_CATEGORIES] as const).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            aria-pressed={filter === category}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-all duration-300",
              filter === category
                ? "border-forest/40 bg-forest text-ink shadow-glow"
                : "border-white/10 bg-white/[0.03] text-text-secondary hover:border-forest/30 hover:text-text-primary"
            )}
          >
            {category === "all" ? "All" : MEMBER_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading members…
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <EmptyPanel
            title="No members in this category"
            message="Add a member, or import the verified Club Details.pdf collection from the dashboard header."
            action={
              <button
                type="button"
                onClick={openCreate}
                className={primaryButtonClass}
              >
                Add member
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <li
              key={item._id}
              className="group flex gap-3 rounded-card border border-border bg-surface/70 p-3 shadow-editorial transition-all duration-500 ease-editorial hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-hover"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-background-tertiary ring-1 ring-inset ring-white/[0.06]">
                {item.portraitUrl ? (
                  <SafeImage
                    src={item.portraitUrl}
                    alt={item.altText}
                    fill
                    sizes="64px"
                    className="object-cover object-top grayscale transition-all duration-700 group-hover:grayscale-0"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <UserRound className="h-5 w-5 text-text-muted" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-forest/25 bg-forest/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-forest">
                    {MEMBER_CATEGORY_LABELS[item.memberCategory]}
                  </span>
                  {!item.published && (
                    <span className="rounded-full border border-terracotta/30 bg-terracotta/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-terracotta">
                      Draft
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-forest">
                  {item.fullName}
                </p>
                <p className="truncate text-[11px] text-text-secondary">
                  {item.role}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className={cn(secondaryButtonClass, "h-7 px-2 py-0 text-[9px]")}
                  >
                    <Edit2 className="h-3 w-3" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className={cn(
                      iconButtonClass,
                      "h-7 w-7 border-status-error/25 text-status-error hover:border-status-error/45 hover:bg-status-error/10 hover:text-status-error"
                    )}
                    aria-label={`Delete ${item.fullName}`}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <AdminModal
          title={editing ? "Edit member" : "Add member"}
          description="Use the exact documented name and role. Do not invent responsibilities or biographies."
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
                form="member-form"
                label={editing ? "Save changes" : "Add member"}
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
          <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="member-name" required>
                <input
                  id="member-name"
                  type="text"
                  required
                  maxLength={120}
                  value={form.fullName}
                  onChange={(event) => update("fullName", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Role"
                htmlFor="member-role"
                required
                hint="Documented role, or the category name if no individual title is documented."
              >
                <input
                  id="member-role"
                  type="text"
                  required
                  maxLength={120}
                  value={form.role}
                  onChange={(event) => update("role", event.target.value)}
                  className={inputClass}
                  placeholder="e.g. President"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="member-category" required>
                <select
                  id="member-category"
                  value={form.memberCategory}
                  onChange={(event) =>
                    update(
                      "memberCategory",
                      event.target.value as MemberCategory
                    )
                  }
                  className={inputClass}
                >
                  {MEMBER_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {MEMBER_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Display order"
                htmlFor="member-order"
                hint="Lower numbers appear first within the category."
              >
                <input
                  id="member-order"
                  type="number"
                  min={0}
                  max={9999}
                  value={form.displayOrder}
                  onChange={(event) =>
                    update("displayOrder", Number(event.target.value))
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label="Department (optional)"
              htmlFor="member-department"
              hint="Faculty only, e.g. Department of Education."
            >
              <input
                id="member-department"
                type="text"
                maxLength={200}
                value={form.department}
                onChange={(event) => update("department", event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Verified biography (optional)"
              htmlFor="member-bio"
              hint="Leave blank unless a biography is documented in the official material."
            >
              <textarea
                id="member-bio"
                rows={3}
                maxLength={2000}
                value={form.biography}
                onChange={(event) => update("biography", event.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">
                Portrait
              </p>
              <ImageDropzone
                id="member-portrait-file"
                preview={preview}
                alt="Portrait preview"
                label="Upload a portrait"
                hint="Click or drag · portrait crops look best"
                onFile={applyFile}
                fit="cover"
                className="mx-auto h-52 w-44"
              />
            </div>

            <Field label="Or paste a portrait URL" htmlFor="member-portrait-url">
              <input
                id="member-portrait-url"
                type="text"
                value={form.portraitUrl}
                onChange={(event) => update("portraitUrl", event.target.value)}
                placeholder="/assets/team/example.jpg or https://res.cloudinary.com/…"
                className={inputClass}
              />
            </Field>

            <Field
              label="Portrait alt text"
              htmlFor="member-alt"
              hint="Defaults to “Portrait of [name]” when left blank."
            >
              <input
                id="member-alt"
                type="text"
                maxLength={300}
                value={form.altText}
                onChange={(event) => update("altText", event.target.value)}
                className={inputClass}
              />
            </Field>

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
          title="Delete this member?"
          message={`“${deleteTarget.fullName}” will be removed from the About page. This cannot be undone.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
