"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Database,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import GalleryManager from "./GalleryManager";
import ActivitiesManager from "./ActivitiesManager";
import MembersManager from "./MembersManager";
import {
  AdminModal,
  AdminNotice,
  primaryButtonClass,
  secondaryButtonClass,
} from "./AdminUi";
import { apiRequest, errorMessage } from "./api";
import { cn } from "@/lib/utils";
import { Aurora } from "@/components/react-bits/Aurora";
import { GradientText } from "@/components/react-bits/GradientText";

type Tab = "gallery" | "activities" | "members";

interface SeedResult {
  galleryInserted: number;
  activitiesInserted: number;
  membersInserted: number;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "gallery", label: "Gallery" },
  { key: "activities", label: "Activities" },
  { key: "members", label: "Members" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("gallery");
  const [loggingOut, setLoggingOut] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState("");
  const [seedError, setSeedError] = useState("");
  const [dataVersion, setDataVersion] = useState(0);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedError("");
    setSeedNotice("");
    try {
      const payload = await apiRequest<SeedResult>("/api/admin/seed", {
        method: "POST",
      });
      const counts = payload.data;
      const total =
        counts.galleryInserted +
        counts.activitiesInserted +
        counts.membersInserted;

      setSeedNotice(
        total > 0
          ? `Imported ${counts.galleryInserted} photographs, ${counts.activitiesInserted} activities and ${counts.membersInserted} member records.`
          : "All collections already contain records, so nothing was imported. Delete existing records first if you want to re-import the starter set."
      );
      setSeedOpen(false);
      setDataVersion((version) => version + 1);
    } catch (requestError) {
      setSeedError(errorMessage(requestError));
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Aurora className="opacity-50" />

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-background/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="relative h-9 w-24 shrink-0 transition-opacity hover:opacity-80"
              aria-label="ShutterScape home"
            >
              <Image
                src="/assets/club/logo_2.png"
                alt="ShutterScape"
                fill
                sizes="96px"
                className="object-contain object-left"
              />
            </Link>
            <span className="hidden border-l border-white/10 pl-3 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted sm:inline">
              Content Studio
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-forest sm:inline-flex"
            >
              View site
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setSeedError("");
                setSeedOpen(true);
              }}
              className={cn(secondaryButtonClass, "h-9 px-3 py-0")}
            >
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Import content</span>
              <span className="sm:hidden">Import</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-transparent px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-status-error/25 hover:bg-status-error/10 hover:text-status-error disabled:opacity-60"
            >
              {loggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {loggingOut ? "Signing out…" : "Log out"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/[0.06] px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-forest">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Authorised administrators only
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-text-primary sm:text-4xl">
              ShutterScape <GradientText className="italic">content</GradientText>
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-text-secondary">
              Gallery, activities and member records are saved to MongoDB.
              Uploaded images are stored in Cloudinary; secrets stay on the
              server.
            </p>
          </div>
          <span className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
            Studio workspace
          </span>
        </div>

        <div className="space-y-2">
          {seedNotice && <AdminNotice tone="success">{seedNotice}</AdminNotice>}
          {seedError && <AdminNotice tone="error">{seedError}</AdminNotice>}
        </div>

        <div
          className="mt-6 inline-flex w-fit gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-xl"
          role="tablist"
          aria-label="Content type"
        >
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`tab-${item.key}`}
                aria-selected={active}
                aria-controls={`panel-${item.key}`}
                onClick={() => setTab(item.key)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 sm:px-5",
                  active ? "text-ink" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-active-tab"
                    className="absolute inset-0 -z-10 rounded-full bg-forest shadow-glow"
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-4 rounded-card border border-white/[0.07] bg-surface/60 p-4 backdrop-blur-xl sm:p-6"
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
        >
          {tab === "gallery" && <GalleryManager key={`gallery-${dataVersion}`} />}
          {tab === "activities" && (
            <ActivitiesManager key={`activities-${dataVersion}`} />
          )}
          {tab === "members" && <MembersManager key={`members-${dataVersion}`} />}
        </div>
      </main>

      {seedOpen && (
        <AdminModal
          title="Import verified starter content"
          description="This copies the content extracted from Club Details.pdf into MongoDB."
          onClose={() => {
            if (!seeding) setSeedOpen(false);
          }}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-text-secondary">
              <p className="font-medium text-text-primary">Imported collections</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>18 original club photographs with verified captions</li>
                <li>3 activities, with exact dates only where documented</li>
                <li>
                  15 member records: 2 faculty, 3 leadership, 6 core, 4 alumni
                </li>
              </ul>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              Only empty collections are filled. Existing records are never
              overwritten, so this action can be retried safely.
            </p>

            {seedError && <AdminNotice tone="error">{seedError}</AdminNotice>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className={cn("flex-1", primaryButtonClass)}
              >
                {seeding && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {seeding ? "Importing…" : "Import verified content"}
              </button>
              <button
                type="button"
                onClick={() => setSeedOpen(false)}
                disabled={seeding}
                className={cn("flex-1", secondaryButtonClass)}
              >
                Cancel
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
