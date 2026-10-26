"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/react-bits/ScrollReveal";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { Aurora } from "@/components/react-bits/Aurora";
import { GALLERY_CATEGORIES } from "@/lib/constants";
import type { GalleryRecord } from "@/lib/content-types";
import { cn } from "@/lib/utils";

const FILTERS = ["All", ...GALLERY_CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

interface GalleryClientProps {
  items: GalleryRecord[];
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const [filter, setFilter] = useState<Filter>("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  const active = activeIndex === null ? null : filtered[activeIndex] ?? null;

  const close = useCallback(() => {
    setActiveIndex(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) => {
        if (current === null) return null;
        return (current + direction + filtered.length) % filtered.length;
      });
    },
    [filtered.length]
  );

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
        return;
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, close, step]);

  return (
    <div className="relative pb-8">
      <Aurora className="opacity-60" />
      <PageContainer className="relative">
        <div className="pt-12 sm:pt-16">
          <SectionHeading
            as="h1"
            index="01"
            label="Gallery"
            title="Frames from ShutterScape"
            description="Photographs made by club members at GCU: exhibitions, workshops, photowalks and the work behind the lens."
          />
        </div>

        <ScrollReveal duration={0.6}>
          <div className="flex flex-col gap-4 rounded-card border border-white/[0.07] bg-white/[0.02] p-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter gallery by category"
            >
              {FILTERS.map((category) => {
                const isActive = filter === category;
                const count =
                  category === "All"
                    ? items.length
                    : items.filter((item) => item.category === category).length;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setFilter(category);
                      setActiveIndex(null);
                    }}
                    aria-pressed={isActive}
                    className={cn(
                      "relative inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
                      isActive
                        ? "border-forest/40 text-ink"
                        : "border-transparent bg-white/[0.03] text-text-secondary hover:border-forest/30 hover:text-text-primary"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="gallery-filter-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-forest shadow-glow"
                        transition={{ type: "spring", stiffness: 340, damping: 32 }}
                      />
                    )}
                    <span className="relative">{category}</span>
                    <span
                      className={cn(
                        "relative rounded-full px-1.5 text-[10px] tabular-nums",
                        isActive
                          ? "bg-ink/15 text-ink"
                          : "bg-background-secondary text-text-muted"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="px-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
              {String(filtered.length).padStart(2, "0")} frames ·{" "}
              {filter === "All" ? "all categories" : filter}
            </p>
          </div>
        </ScrollReveal>

        <p aria-live="polite" className="sr-only">
          {filtered.length} photographs shown
        </p>

        {filtered.length === 0 ? (
          <div className="my-16 rounded-card border border-dashed border-border bg-surface p-10 text-center">
            <h3 className="font-display text-xl font-semibold text-text-primary">
              No photographs in this category yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Choose another category to see the rest of the collection.
            </p>
            <button
              type="button"
              onClick={() => setFilter("All")}
              className="shine-hover mt-5 rounded-full bg-forest px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink shadow-glow"
            >
              Show all photographs
            </button>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => {
              const date = formatDate(item.eventDate);
              return (
                <li key={item.id}>
                  <ScrollReveal delay={Math.min(index, 6) * 0.06} distance={20}>
                    <SpotlightCard
                      className="card-surface h-full"
                      spotlightColor="rgba(110, 231, 183, 0.12)"
                    >
                      <article className="group flex h-full flex-col">
                        <button
                          type="button"
                          ref={index === 0 ? triggerRef : undefined}
                          onClick={(event) => {
                            triggerRef.current = event.currentTarget;
                            setActiveIndex(index);
                          }}
                          className="relative block w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest"
                          aria-label={`Open photograph: ${item.title}`}
                        >
                          <PhotoFrame
                            src={item.imageUrl}
                            alt={item.altText}
                            aspect="4 / 3"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            zoomOnHover
                            imgClassName="grayscale transition-all duration-700 group-hover:grayscale-0"
                          />
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                          />
                          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-text-invert backdrop-blur-md">
                            {item.category}
                          </span>
                          <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-forest text-ink opacity-0 shadow-glow transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                            <Expand className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </button>

                        <div className="flex flex-1 flex-col gap-1.5 p-5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {date && (
                              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
                                {date}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-lg font-semibold leading-snug text-text-primary transition-colors group-hover:text-forest">
                            {item.title}
                          </h3>
                          <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
                            {item.caption}
                          </p>
                        </div>
                      </article>
                    </SpotlightCard>
                  </ScrollReveal>
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>

      <AnimatePresence>
        {active && activeIndex !== null && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col bg-background/95 p-4 backdrop-blur-2xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-4 text-text-invert">
              <div className="min-w-0">
                <p className="truncate font-display text-base font-medium sm:text-lg">
                  {active.title}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-invert/50">
                  {active.category}
                  {formatDate(active.eventDate)
                    ? ` · ${formatDate(active.eventDate)}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                ref={closeButtonRef}
                onClick={close}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-invert transition-colors hover:border-forest/40 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                aria-label="Close photograph viewer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative mt-4 flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-ink"
            >
              <SafeImage
                src={active.imageUrl}
                alt={active.altText}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>

            <div className="mt-4 flex flex-col gap-4 text-text-invert/65 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-xs leading-relaxed sm:text-sm">
                {active.caption}
              </p>
              <div className="flex shrink-0 items-center gap-2 self-end">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:border-forest/40 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                  aria-label="Previous photograph"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="font-mono text-[10px] tabular-nums tracking-[0.14em]">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(filtered.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:border-forest/40 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                  aria-label="Next photograph"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
