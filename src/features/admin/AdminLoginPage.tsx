"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { inputClass } from "./AdminUi";
import { Aurora } from "@/components/react-bits/Aurora";
import { GradientText } from "@/components/react-bits/GradientText";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

      if (response.ok && payload?.success) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      setError(
        payload?.message ||
          (response.status === 429
            ? "Too many attempts. Please wait before trying again."
            : "Sign-in failed. Check your credentials and try again.")
      );
    } catch {
      setError("The server could not be reached. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <Aurora />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.16] mask-fade-b"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="gradient-border relative w-full max-w-md space-y-6 rounded-[24px] border border-white/10 bg-surface/80 p-7 shadow-lift backdrop-blur-2xl sm:p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative h-14 w-36">
            <Image
              src="/assets/club/logo_2.png"
              alt="ShutterScape"
              fill
              sizes="144px"
              className="object-contain drop-shadow-[0_0_20px_rgba(110,231,183,0.2)]"
              priority
            />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-wide text-text-primary">
              Admin <GradientText className="italic">Portal</GradientText>
            </h1>
            <p className="mt-1 text-xs text-text-secondary">
              ShutterScape · Girijananda Choudhury University
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[11px] leading-relaxed text-text-secondary">
          <LockKeyhole
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest"
            aria-hidden="true"
          />
          Authorised administrators only. Accounts are provisioned manually;
          there is no public registration.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-status-error/25 bg-status-error/10 px-3 py-2 text-xs leading-relaxed text-status-error"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="shine-hover inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            <span className="relative z-10">
              {loading ? "Signing in…" : "Sign In"}
            </span>
          </button>
        </form>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-forest"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to the website
        </Link>
      </motion.div>
    </main>
  );
}
