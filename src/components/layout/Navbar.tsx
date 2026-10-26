"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLUB } from "@/lib/constants";
import { Magnetic } from "@/components/react-bits/Magnetic";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Activities", href: "/activities" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  // rAF-throttled, passive scroll listener: one React render per threshold
  // crossing instead of one per scroll event.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const next = window.scrollY > 8;
      setScrolled((previous) => (previous === next ? previous : next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
    window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  }, []);

  // Close on navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close the drawer if the viewport becomes desktop-sized.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Lock body scroll without shifting the page when the scrollbar disappears.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    const focusTimer = window.setTimeout(() => firstLinkRef.current?.focus(), 60);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, [mobileMenuOpen]);

  // Escape closes; Tab is trapped inside the open drawer.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.offsetParent !== null);

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
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeMenu, mobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-500",
        scrolled
          ? "border-b border-border bg-background/80 shadow-[0_1px_0_rgba(255,255,255,0.05),0_24px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-[64px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          aria-label="ShutterScape home"
        >
          <div className="relative h-8 w-24 transition-transform duration-500 ease-editorial group-hover:-translate-y-0.5 sm:h-10 sm:w-28">
            <Image
              src="/assets/club/logo_2.png"
              alt="ShutterScape"
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-contain object-left drop-shadow-[0_0_18px_rgba(110,231,183,0.18)]"
              priority
            />
          </div>
          <div className="hidden flex-col border-l border-border py-0.5 pl-3.5 lg:flex">
            <span className="font-mono text-[9px] uppercase leading-tight tracking-[0.22em] text-text-primary">
              GCU Photography Club
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-text-muted">
              Est. 2023 · Guwahati
            </span>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl md:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-[13px] font-medium tracking-wide transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
                  active
                    ? "text-forest"
                    : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary"
                )}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 -z-10 rounded-full border border-forest/25 bg-forest/15"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={CLUB.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors hover:text-forest"
          >
            Join club
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
          <Magnetic strength={0.18} max={6}>
            <Link
              href="/gallery"
              className="shine-hover group inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-forest px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-hover"
            >
              <span className="relative z-10">Explore</span>
              <ArrowUpRight
                className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Magnetic>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-text-primary backdrop-blur-xl transition-colors hover:border-forest/40 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Reading progress hairline */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-forest via-terracotta to-forest"
        style={{ scaleX: progress }}
      />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 top-[64px] z-40 flex flex-col overflow-y-auto overscroll-contain border-t border-white/5 bg-background/95 px-5 pb-10 pt-6 backdrop-blur-2xl sm:top-[76px] md:hidden"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-forest/10 blur-[100px]"
            />
            <nav className="relative flex flex-col" aria-label="Mobile navigation links">
              {NAV_LINKS.map((link, index) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.05 + index * 0.06,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "group flex items-baseline justify-between border-b border-white/[0.06] py-5 font-display text-[2rem] font-medium leading-none tracking-tight transition-colors",
                        active
                          ? "text-forest"
                          : "text-text-primary hover:text-forest"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{link.label}</span>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-text-muted transition-colors group-hover:text-forest">
                        0{index + 1}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="relative mt-8 space-y-3">
              <a
                href={CLUB.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="shine-hover flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink shadow-glow"
              >
                <span className="relative z-10">Join WhatsApp Group</span>
                <ArrowUpRight className="relative z-10 h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={CLUB.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white/[0.03] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-text-primary transition-colors hover:border-forest/40 hover:text-forest"
              >
                Instagram
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <p className="relative mt-auto pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              Girijananda Choudhury University · Azara
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
