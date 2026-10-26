import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  MoveDown,
  Sparkles,
} from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { BlurText } from "@/components/react-bits/BlurText";
import { ScrollReveal } from "@/components/react-bits/ScrollReveal";
import { TiltedCard } from "@/components/react-bits/TiltedCard";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { Marquee } from "@/components/react-bits/Marquee";
import { CountUp } from "@/components/react-bits/CountUp";
import { Magnetic } from "@/components/react-bits/Magnetic";
import { Parallax } from "@/components/react-bits/Parallax";
import { Aurora } from "@/components/react-bits/Aurora";
import { GradientText } from "@/components/react-bits/GradientText";
import { getActivities, getGallery, getMembers } from "@/lib/content";
import type { ActivityRecord, GalleryRecord } from "@/lib/content-types";
import { cleanText } from "@/lib/validation";
import { CLUB } from "@/lib/constants";

function formatActivityDate(activity: ActivityRecord) {
  if (activity.activityDate) {
    const date = new Date(activity.activityDate);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
    }
  }
  return activity.dateLabel ?? "Club activity";
}

function activityTime(activity: ActivityRecord) {
  if (!activity.activityDate) return 0;
  const time = Date.parse(activity.activityDate);
  return Number.isNaN(time) ? 0 : time;
}

function pickFeatured(gallery: GalleryRecord[]): GalleryRecord[] {
  const picks: GalleryRecord[] = [];
  const add = (item?: GalleryRecord) => {
    if (item && !picks.some((existing) => existing.id === item.id)) {
      picks.push(item);
    }
  };

  add(gallery.find((item) => item.imageUrl.includes("world-photography-day-2026-4")));
  add(gallery.find((item) => item.imageUrl.includes("euphuism")));
  add(gallery.find((item) => item.category === "Photowalks"));
  gallery.forEach(add);
  return picks.slice(0, 3);
}

function ActivityPreview({
  activity,
  index,
}: {
  activity: ActivityRecord;
  index: number;
}) {
  return (
    <ScrollReveal delay={index * 0.08} className="h-full">
      <SpotlightCard
        className="card-surface h-full"
        spotlightColor="rgba(251, 146, 60, 0.14)"
      >
        <article className="group flex h-full flex-col">
          {activity.coverImageUrl ? (
            <PhotoFrame
              src={activity.coverImageUrl}
              alt={activity.title}
              aspect="16 / 10"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div
              className="flex items-center justify-center bg-background-tertiary"
              style={{ aspectRatio: "16 / 10" }}
              aria-hidden="true"
            >
              <Camera className="h-9 w-9 text-text-invert/20" />
            </div>
          )}

          <div className="flex flex-1 flex-col gap-3 p-6">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-terracotta">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatActivityDate(activity)}
            </span>
            <h3 className="font-display text-xl font-semibold leading-snug text-text-invert transition-colors group-hover:text-forest">
              {activity.title}
            </h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-text-invert/55">
              {cleanText(activity.description)}
            </p>
            <Link
              href="/activities"
              className="mt-auto inline-flex items-center gap-1.5 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-invert/60 transition-colors hover:text-forest"
            >
              Activity details
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </article>
      </SpotlightCard>
    </ScrollReveal>
  );
}

export default async function HomePage() {
  const [{ items: gallery }, { items: activities }, { items: members }] =
    await Promise.all([getGallery(), getActivities(), getMembers()]);

  const featured = pickFeatured(gallery);
  const recentActivities = [...activities]
    .sort((a, b) => activityTime(b) - activityTime(a))
    .slice(0, 3);
  const strip = gallery.slice(0, 8);

  const stats = [
    { value: gallery.length, label: "Photographs" },
    { value: activities.length, label: "Activities" },
    { value: members.length, label: "Members" },
  ];

  return (
    <div className="overflow-hidden">
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pt-20">
        <Aurora />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.18] mask-fade-b"
        />
        <PageContainer className="relative">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6 xl:col-span-6">
              <ScrollReveal duration={0.6} distance={14}>
                <p className="eyebrow rounded-full border border-forest/20 bg-forest/[0.06] px-3 py-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta/80" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-terracotta" />
                  </span>
                  Photography club · GCU · Est. 2023
                </p>
              </ScrollReveal>

              <h1 className="mt-7 font-display text-[clamp(2.7rem,6.4vw,4.9rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-text-primary">
                <BlurText
                  text="Capturing moments,"
                  className="block"
                  animateBy="words"
                  delay={70}
                />
                <BlurText
                  text="framing perspectives."
                  className="block italic text-forest"
                  animateBy="words"
                  delay={62}
                />
              </h1>

              <ScrollReveal delay={0.25} distance={18}>
                <p className="mt-6 max-w-lg text-pretty text-[15px] leading-relaxed text-text-secondary sm:text-base">
                  ShutterScape is the photography club of Girijananda Choudhury
                  University — a space for students who love to observe, capture
                  and tell stories through photographs. Camera or phone, there is
                  a place for you here.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.35} distance={18}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Magnetic strength={0.2} max={8}>
                    <Link
                      href="/gallery"
                      className="shine-hover group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-hover"
                    >
                      <span className="relative z-10">Explore the gallery</span>
                      <ArrowRight
                        className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </Magnetic>
                  <Link
                    href="/activities"
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-white/[0.03] px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/40 hover:text-forest"
                  >
                    <CalendarDays className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-6" aria-hidden="true" />
                    Club activities
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.45} distance={18}>
                <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="glass-panel group p-4 transition-all duration-500 hover:-translate-y-1 hover:border-forest/30"
                    >
                      <dd className="font-display text-3xl font-semibold leading-none text-text-primary transition-colors group-hover:text-forest sm:text-4xl">
                        <CountUp to={stat.value} />
                      </dd>
                      <dt className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted sm:text-[10px]">
                        {stat.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </ScrollReveal>
            </div>

            {/* Photo stack */}
            <div className="lg:col-span-6">
              <Parallax
                distance={26}
                className="relative mx-auto w-full max-w-[440px] pb-6 sm:max-w-[500px] lg:max-w-none lg:pb-16"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-6 rounded-full bg-gradient-to-br from-forest/20 via-transparent to-terracotta/20 blur-[80px]"
                />
                <div className="polaroid relative -rotate-[2deg]">
                  <PhotoFrame
                    src="/assets/photos/hero-cover.jpg"
                    alt="A ShutterScape member silhouetted against a bright background while holding a camera"
                    aspect="4 / 5"
                    priority
                    sizes="(max-width: 1024px) 88vw, 42vw"
                    className="rounded-frame"
                  />
                  <div className="flex items-center justify-between gap-3 px-1 pb-0.5 pt-3">
                    <p className="font-display text-sm italic text-text-primary">
                      Through the viewfinder
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                      GCU · Azara
                    </p>
                  </div>
                </div>

                <span className="tape -top-2 left-10 z-10 -rotate-[18deg]" aria-hidden="true" />

                <div className="absolute -bottom-2 -left-6 hidden w-[46%] rotate-[4deg] lg:block">
                  <div className="polaroid animate-soft-float">
                    <PhotoFrame
                      src="/assets/photos/photowalk-group.jpg"
                      alt="ShutterScape members with cameras on a photowalk at Barduar Tea Garden"
                      aspect="4 / 5"
                      sizes="(max-width: 1024px) 42vw, 20vw"
                      className="rounded-frame"
                    />
                    <p className="px-1 pb-0.5 pt-2.5 font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted">
                      Photowalk · Barduar
                    </p>
                  </div>
                </div>

                <div className="absolute -right-3 top-6 hidden rotate-90 items-center gap-3 font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted sm:flex lg:-right-6">
                  <span className="h-px w-10 bg-border" />
                  Observe · Capture · Tell
                </div>
              </Parallax>
            </div>
          </div>

          <a
            href="#manifesto"
            className="mt-6 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted transition-colors hover:text-forest"
          >
            <span className="relative flex h-6 w-4 items-start justify-center overflow-hidden rounded-full border border-border">
              <span className="mt-1 h-1.5 w-1.5 animate-scroll-cue rounded-full bg-forest" />
            </span>
            Scroll to explore
            <MoveDown className="h-3 w-3" aria-hidden="true" />
          </a>
        </PageContainer>
      </section>

      {/* ------------------------------------------------------------- Marquee */}
      {strip.length > 0 && (
        <section className="border-y border-white/[0.07] bg-background-secondary/60 py-5">
          <div className="mb-4 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-muted">
              From the archive — {String(gallery.length).padStart(2, "0")} frames
            </p>
            <Link
              href="/gallery"
              className="link-underline font-mono text-[9px] uppercase tracking-[0.2em] text-forest"
            >
              See all
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          <Marquee duration={58}>
            {strip.map((photo, index) => (
              <figure key={photo.id} className="group w-[180px] shrink-0 sm:w-[230px]">
                <div className="overflow-hidden rounded-frame border border-white/[0.07] bg-surface p-1 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-forest/30 group-hover:shadow-glow">
                  <PhotoFrame
                    src={photo.imageUrl}
                    alt={photo.altText}
                    aspect="4 / 3"
                    sizes="230px"
                    className="rounded-[6px]"
                    zoomOnHover
                  />
                </div>
                <figcaption className="mt-2 flex items-center justify-between gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted">
                  <span className="truncate transition-colors group-hover:text-forest">
                    {photo.category}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </figcaption>
              </figure>
            ))}
          </Marquee>
        </section>
      )}

      {/* ----------------------------------------------------------- Manifesto */}
      <section id="manifesto" className="relative scroll-mt-28 py-20 sm:py-28">
        <PageContainer>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <ScrollReveal>
                <p className="eyebrow">
                  <span className="font-mono text-terracotta">01</span>
                  <span aria-hidden="true" className="h-px w-8 bg-forest/30" />
                  Who we are
                </p>
                <h2 className="mt-5 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-text-primary text-balance">
                  No camera? No problem.{" "}
                  <GradientText className="italic">
                    Your phone is enough to start.
                  </GradientText>
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="mt-8 grid grid-cols-3 gap-2">
                  {["Photowalks", "Exhibitions", "Workshops"].map((item, index) => (
                    <div
                      key={item}
                      className="group rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-3 text-center transition-all duration-500 hover:-translate-y-1 hover:border-forest/30 hover:bg-forest/[0.05]"
                    >
                      <Sparkles
                        className="mx-auto h-3.5 w-3.5 text-terracotta transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
                        aria-hidden="true"
                      />
                      <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-text-muted transition-colors group-hover:text-forest sm:text-[9px]">
                        {item}
                      </p>
                      <span className="sr-only">{index + 1}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <div className="space-y-6 lg:col-span-6">
              <ScrollReveal delay={0.1}>
                <p className="text-pretty text-base leading-relaxed text-text-secondary sm:text-lg">
                  ShutterScape was introduced at GCU in 2023 as a space where
                  students could explore photography, creativity and visual
                  storytelling. The club brings together experienced
                  photographers and students who simply enjoy taking photographs.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.18}>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  Members take part in photography sessions, exhibitions,
                  photowalks and campus challenges — learning from each other
                  rather than from a syllabus.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.26}>
                <blockquote className="gradient-border relative rounded-card border border-white/[0.07] bg-surface/60 p-6">
                  <p className="font-display text-2xl italic leading-snug text-text-primary sm:text-[1.75rem]">
                    “Your eye. Your idea. Your story.”
                  </p>
                  <footer className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                    ShutterScape · Club ethos
                  </footer>
                </blockquote>
              </ScrollReveal>

              <ScrollReveal delay={0.34}>
                <Link
                  href="/about"
                  className="link-underline font-mono text-[10px] uppercase tracking-[0.2em] text-forest"
                >
                  More about the club
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* -------------------------------------------------------------- Frames */}
      <section id="frames" className="scroll-mt-28 pb-4">
        <PageContainer>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              index="02"
              label="Selected work"
              title="Frames from the club"
              description="A short selection of original photographs made during ShutterScape activities and exhibitions."
              className="mb-0"
            />
            <ScrollReveal delay={0.1} className="shrink-0">
              <Link
                href="/gallery"
                className="shine-hover group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-white/[0.03] px-5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/40 hover:text-forest"
              >
                <span className="relative z-10">View full gallery</span>
                <ArrowRight
                  className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </ScrollReveal>
          </div>

          {featured.length === 0 ? (
            <p className="mt-10 rounded-card border border-dashed border-border bg-surface p-8 text-sm text-text-secondary">
              No photographs have been published yet.
            </p>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((photo, index) => (
                <ScrollReveal key={photo.id} delay={index * 0.09} className="h-full">
                  <TiltedCard rotate={4} scaleOnHover={1.01} className="h-full">
                    <SpotlightCard
                      className="h-full rounded-card"
                      spotlightColor="rgba(110, 231, 183, 0.12)"
                    >
                      <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface/80 transition-[border-color,box-shadow] duration-500 hover:border-forest/30 hover:shadow-hover">
                        <div className="relative overflow-hidden">
                          <PhotoFrame
                            src={photo.imageUrl}
                            alt={photo.altText}
                            aspect="4 / 3"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            zoomOnHover
                          />
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                          />
                          <span className="absolute left-3 top-3">
                            <Badge variant="forest">{photo.category}</Badge>
                          </span>
                          <span className="absolute bottom-3 right-3 inline-flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-forest text-ink opacity-0 shadow-glow transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col gap-2 p-5">
                          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted">
                            {String(index + 1).padStart(2, "0")} / Frame
                          </span>
                          <h3 className="font-display text-xl font-semibold leading-snug text-text-primary transition-colors group-hover:text-forest">
                            {photo.title}
                          </h3>
                          <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
                            {photo.caption}
                          </p>
                          <div className="mt-auto flex items-center gap-1.5 pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-forest opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                            Open in gallery
                            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          </div>
                        </div>
                      </article>
                    </SpotlightCard>
                  </TiltedCard>
                </ScrollReveal>
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      {/* ---------------------------------------------------------- Activities */}
      <section className="relative mt-20 overflow-hidden border-y border-white/[0.07] bg-ink py-20 text-text-invert sm:mt-24 sm:py-24">
        <Aurora className="opacity-60" />
        <div aria-hidden="true" className="grain-overlay pointer-events-none absolute inset-0" />
        <PageContainer className="relative">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              index="03"
              tone="dark"
              label="Club initiatives"
              title="Recent activities"
              description="Exhibitions, photography sessions and campus challenges from the club's timeline."
              className="mb-0"
            />
            <ScrollReveal delay={0.1} className="shrink-0">
              <Link
                href="/activities"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-text-invert/20 px-5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-invert transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/50 hover:bg-white/5 hover:text-forest"
              >
                View timeline
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </ScrollReveal>
          </div>

          {recentActivities.length === 0 ? (
            <p className="mt-10 rounded-card border border-dashed border-ink-line p-8 text-sm text-text-invert/60">
              No activities have been published yet.
            </p>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentActivities.map((activity, index) => (
                <ActivityPreview key={activity.id} activity={activity} index={index} />
              ))}
            </div>
          )}
        </PageContainer>
      </section>

      {/* --------------------------------------------------------------- Join */}
      <section className="relative py-20 sm:py-28">
        <PageContainer>
          <ScrollReveal>
            <div className="gradient-border relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-surface/70 px-6 py-14 text-center sm:px-12 sm:py-16">
              <Aurora className="opacity-80" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-forest/70 to-transparent"
              />
              <div className="relative">
                <p className="eyebrow justify-center">Join the community</p>
                <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-text-primary text-balance">
                  Ready to share{" "}
                  <GradientText className="italic">your perspective?</GradientText>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
                  Follow ShutterScape for photographs, event updates and
                  opportunities to take part. Open to every GCU student.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Magnetic strength={0.2} max={8}>
                    <a
                      href={CLUB.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shine-hover group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-hover"
                    >
                      <span className="relative z-10">Join the WhatsApp group</span>
                      <ArrowUpRight
                        className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </Magnetic>
                  <a
                    href={CLUB.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/40 hover:text-forest"
                  >
                    @shutterscape_gcu
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </div>
                <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                  No prior experience needed · Phone or camera
                </p>
              </div>
            </div>
          </ScrollReveal>
        </PageContainer>
      </section>
    </div>
  );
}
