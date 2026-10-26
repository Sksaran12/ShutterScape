"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Shared admin styling helpers                                              */
/* -------------------------------------------------------------------------- */

export const primaryButtonClass =
  "shine-hover inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-forest px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-hover disabled:pointer-events-none disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-white/[0.03] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-primary transition-colors hover:border-forest/40 hover:text-forest disabled:pointer-events-none disabled:opacity-60";

export const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-text-secondary transition-colors hover:border-forest/40 hover:text-forest";

export const statusPillClass =
  "rounded-full border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]";

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-forest/50 focus:outline-none focus:ring-2 focus:ring-forest/20";

/**
 * Mounts children on document.body so fixed-position overlays are never
 * trapped by a blurred / transformed ancestor (the admin tab panel uses
 * backdrop-blur, which would otherwise become their containing block).
 */
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}

/** Shared overlay chrome: scroll lock, Escape, backdrop click and focus. */
function useOverlay(onClose: () => void, busy?: boolean) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);

  closeRef.current = onClose;
  busyRef.current = busy;

  // Runs once per mount: re-running on every render would steal focus from
  // the fields while the user is typing.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, []);

  return dialogRef;
}

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                           */
/* -------------------------------------------------------------------------- */

export function AdminNotice({
  tone,
  children,
}: {
  tone: "success" | "error" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-status-success/25 bg-status-success/10 text-status-success",
    error: "border-status-error/25 bg-status-error/10 text-status-error",
    info: "border-border bg-white/[0.03] text-text-secondary",
  };
  return (
    <p
      className={cn("rounded-xl border px-3 py-2 text-xs", styles[tone])}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary"
      >
        {label}
        {required && <span className="ml-1 text-terracotta">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] leading-relaxed text-text-muted">{hint}</p>}
    </div>
  );
}

/**
 * Click-or-drop image picker used by the gallery, activity and member forms.
 * The whole box is a label, so a click anywhere opens the file dialog.
 */
export function ImageDropzone({
  id,
  preview,
  alt,
  label,
  hint,
  onFile,
  className,
  fit = "contain",
}: {
  id: string;
  preview: string;
  alt: string;
  label: string;
  hint?: string;
  onFile: (file: File) => void;
  className?: string;
  fit?: "contain" | "cover";
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-white/[0.02] text-center transition-colors duration-300",
        dragging
          ? "border-forest/70 bg-forest/[0.08]"
          : "border-white/15 hover:border-forest/50 hover:bg-forest/[0.04]",
        className
      )}
    >
      {preview ? (
        <>
          <SafeImage
            src={preview}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className={cn(fit === "cover" ? "object-cover" : "object-contain p-2")}
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-2.5 pt-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-invert">
            Click or drop to replace
          </span>
        </>
      ) : (
        <span className="flex flex-col items-center gap-2.5 px-5 py-7">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-forest/25 bg-forest/10 text-forest transition-transform duration-300 group-hover:scale-105">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-text-primary">{label}</span>
          <span className="max-w-[20rem] text-[11px] leading-relaxed text-text-muted">
            {hint ?? "Click to browse or drag an image here · JPEG, PNG or WebP, up to 15 MB"}
          </span>
        </span>
      )}
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
        className="sr-only"
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dialogs                                                                   */
/* -------------------------------------------------------------------------- */

export function AdminModal({
  title,
  description,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  const dialogRef = useOverlay(onClose);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={cn(
            "gradient-border flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-[20px] border border-white/10 bg-surface shadow-lift outline-none",
            wide ? "max-w-3xl" : "max-w-xl"
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.07] bg-surface px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-text-secondary transition-colors hover:border-forest/40 hover:text-forest"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
            {children}
          </div>

          {footer && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none -mt-6 h-6 shrink-0 bg-gradient-to-t from-surface to-transparent"
              />
              <footer className="flex shrink-0 flex-col gap-2 border-t border-white/[0.07] bg-surface px-4 py-3.5 sm:flex-row sm:gap-3 sm:py-4 sm:px-6">
                {footer}
              </footer>
            </>
          )}
        </div>
      </div>
    </Portal>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useOverlay(onCancel, busy);

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className="w-full max-w-sm rounded-[20px] border border-white/10 bg-surface p-5 shadow-lift outline-none"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-status-error/25 bg-status-error/10 text-status-error">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">{message}</p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-status-error px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-status-error/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {busy ? "Deleting…" : confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className={cn("flex-1", secondaryButtonClass)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export function EmptyPanel({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-card border border-dashed border-border bg-surface/60 p-10 text-center">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
      <h3 className="relative font-display text-lg font-semibold text-text-primary">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-sm text-xs leading-relaxed text-text-secondary">
        {message}
      </p>
      {action && <div className="relative mt-4">{action}</div>}
    </div>
  );
}

export function SaveButton({
  saving,
  label,
  form,
}: {
  saving: boolean;
  label: string;
  /** Lets the button live in the modal footer while submitting the form body. */
  form?: string;
}) {
  return (
    <button
      type="submit"
      form={form}
      disabled={saving}
      className={cn("flex-1", primaryButtonClass)}
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      )}
      {saving ? "Saving…" : label}
    </button>
  );
}
