import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Instagram, MapPin } from "lucide-react";
import { CLUB } from "@/lib/constants";
import { PageContainer } from "@/components/ui/PageContainer";
import { Magnetic } from "@/components/react-bits/Magnetic";
import { ScrollReveal } from "@/components/react-bits/ScrollReveal";
import { Aurora } from "@/components/react-bits/Aurora";

const NAVIGATION = [
  { href: "/", label: "Home" },
  { href: "/activities", label: "Activities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About the club" },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-ink text-text-invert">
      <Aurora className="opacity-70" />
      <div aria-hidden="true" className="grain-overlay pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-forest/60 to-transparent"
      />

      <PageContainer className="relative pt-16 sm:pt-20">
        <ScrollReveal>
          <section
            aria-labelledby="footer-community-heading"
            className="grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-12 lg:gap-12"
          >
            <div className="lg:col-span-8">
              <p className="eyebrow-invert">Join the community</p>
              <h2
                id="footer-community-heading"
                className="mt-4 max-w-2xl font-display text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-text-invert text-balance"
              >
                Bring your eye.{" "}
                <span className="text-gradient-animated">We&apos;ll bring the frames.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-invert/60">
                Event updates, photowalk invitations and new work are shared in
                the official WhatsApp group and on Instagram.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Magnetic strength={0.16} max={6}>
                  <a
                    href={CLUB.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shine-hover group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-text-invert px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="relative z-10">Join the WhatsApp group</span>
                    <ArrowUpRight
                      className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </Magnetic>
                <Magnetic strength={0.16} max={6}>
                  <a
                    href={CLUB.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-text-invert/20 px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-invert transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/50 hover:bg-white/5 hover:text-forest"
                  >
                    <Instagram className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
                    @shutterscape_gcu
                  </a>
                </Magnetic>
              </div>
            </div>

            <div className="lg:col-span-4 lg:justify-self-end">
              <a
                href={CLUB.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-border inline-flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition-transform duration-500 hover:-translate-y-1"
                aria-label="Scan the QR code to join the ShutterScape WhatsApp group"
              >
                <Image
                  src="/assets/qr/whatsapp.png"
                  alt="QR code linking to the official ShutterScape WhatsApp group invitation"
                  width={132}
                  height={132}
                  className="h-[132px] w-[132px] rounded-xl bg-white p-1.5"
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-invert/50">
                  Scan to join
                </span>
              </a>
            </div>
          </section>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-10 border-b border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 rounded-xl border border-white/10 bg-white p-1.5">
                <Image
                  src="/assets/university/gcu-logo.png"
                  alt="Girijananda Choudhury University logo"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <div>
                <p className="font-display text-base font-medium leading-snug text-text-invert">
                  Girijananda Choudhury
                  <br />
                  University
                </p>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-terracotta">
                  ShutterScape · Est. 2023
                </p>
              </div>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-text-invert/55">
              The photography club of Girijananda Choudhury University, created
              for students who love to observe, capture and tell stories through
              photographs.
            </p>
            <a
              href={CLUB.map}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-2 text-xs leading-relaxed text-text-invert/60 transition-colors hover:text-text-invert"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-terracotta" aria-hidden="true" />
              <span className="max-w-xs">{CLUB.address}</span>
            </a>
          </div>

          <nav aria-label="Footer navigation" className="space-y-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-invert/40">
              Explore
            </h2>
            <ul className="space-y-2.5 text-sm">
              {NAVIGATION.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-underline text-text-invert/70 transition-colors hover:text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin/login"
                  className="link-underline text-text-invert/35 transition-colors hover:text-text-invert/80"
                >
                  Admin portal
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-invert/40">
              Say hello
            </h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={CLUB.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-text-invert/70 transition-colors hover:text-forest"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={CLUB.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-text-invert/70 transition-colors hover:text-forest"
                >
                  WhatsApp group
                </a>
              </li>
              <li>
                <a
                  href={CLUB.map}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-text-invert/70 transition-colors hover:text-forest"
                >
                  Campus map
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-[11px] text-text-invert/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} ShutterScape, Girijananda Choudhury
            University.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-1.5">
            <span>Website maintained by</span>
            <span className="font-medium text-forest">{CLUB.maintainer}</span>
          </p>
        </div>
      </PageContainer>

      <div aria-hidden="true" className="overflow-hidden px-2">
        <p className="text-outline-invert select-none whitespace-nowrap text-center font-display text-[15vw] font-bold leading-[0.85] tracking-[-0.05em]">
          ShutterScape
        </p>
      </div>
    </footer>
  );
};
