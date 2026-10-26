import Link from "next/link";
import { ArrowUpRight, CalendarDays, Camera, PartyPopper } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { ScrollReveal } from "@/components/react-bits/ScrollReveal";
import { Magnetic } from "@/components/react-bits/Magnetic";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { Aurora } from "@/components/react-bits/Aurora";
import { GradientText } from "@/components/react-bits/GradientText";
import { getActivities } from "@/lib/content";
import type { ActivityRecord } from "@/lib/content-types";
import { cleanRichText } from "@/lib/validation";
import { CLUB } from "@/lib/constants";

function activityTime(activity: ActivityRecord): number {
  if (!activity.activityDate) return 0;
  const time = Date.parse(activity.activityDate);
  return Number.isNaN(time) ? 0 : time;
}

function dateLabel(activity: ActivityRecord): string | null {
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
  return activity.dateLabel ?? null;
}

function statusOf(activity: ActivityRecord): "upcoming" | "past" | "undated" {
  if (!activity.activityDate) return "undated";
  return activityTime(activity) >= Date.now() ? "upcoming" : "past";
}

function StatusBadge({ activity }: { activity: ActivityRecord }) {
  const status = statusOf(activity);
  return (
    <Badge
      variant={
        status === "upcoming" ? "upcoming" : status === "past" ? "past" : "neutral"
      }
    >
      {status === "upcoming"
        ? "Upcoming"
        : status === "past"
          ? "Past activity"
          : "Club activity"}
    </Badge>
  );
}

function FeaturedActivity({ activity }: { activity: ActivityRecord }) {
  const label = dateLabel(activity);
  return (
    <SpotlightCard
      className="card-surface"
      spotlightColor="rgba(251, 146, 60, 0.14)"
    >
      <article className="group grid md:grid-cols-12">
        <div className="md:col-span-6">
          {activity.coverImageUrl ? (
            <PhotoFrame
              src={activity.coverImageUrl}
              alt={activity.title}
              aspect="16 / 10"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="h-full md:h-full"
              zoomOnHover
            />
          ) : (
            <div
              className="flex items-center justify-center bg-background-tertiary"
              style={{ aspectRatio: "16 / 10" }}
              aria-hidden="true"
            >
              <Camera className="h-10 w-10 text-text-muted" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-4 p-7 md:col-span-6 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge activity={activity} />
            {label && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                <CalendarDays className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
                {label}
              </span>
            )}
          </div>
          <h3 className="font-display text-2xl font-semibold leading-tight text-text-primary transition-colors group-hover:text-forest sm:text-3xl">
            {activity.title}
          </h3>
          <div
            className="rich-text text-sm leading-relaxed text-text-secondary"
            dangerouslySetInnerHTML={{ __html: cleanRichText(activity.description) }}
          />
          <Link
            href={CLUB.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link mt-1 inline-flex items-center gap-2 self-start font-mono text-[10px] uppercase tracking-[0.18em] text-forest"
          >
            Get event updates
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </article>
    </SpotlightCard>
  );
}

function TimelineCard({ activity }: { activity: ActivityRecord }) {
  const label = dateLabel(activity);
  return (
    <SpotlightCard
      className="card-surface"
      spotlightColor="rgba(110, 231, 183, 0.1)"
    >
      <article className="group grid md:grid-cols-12">
        <div className="md:col-span-4">
          {activity.coverImageUrl ? (
            <PhotoFrame
              src={activity.coverImageUrl}
              alt={activity.title}
              aspect="16 / 10"
              sizes="(max-width: 768px) 100vw, 30vw"
              className="h-full"
              zoomOnHover
            />
          ) : (
            <div
              className="flex items-center justify-center bg-background-tertiary"
              style={{ aspectRatio: "16 / 10" }}
              aria-hidden="true"
            >
              <Camera className="h-8 w-8 text-text-muted" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6 md:col-span-8 lg:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge activity={activity} />
            {label && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                <CalendarDays className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
                {label}
              </span>
            )}
          </div>

          <h3 className="font-display text-xl font-semibold leading-snug text-text-primary transition-colors group-hover:text-forest sm:text-2xl">
            {activity.title}
          </h3>

          <div
            className="rich-text text-sm leading-relaxed text-text-secondary"
            dangerouslySetInnerHTML={{ __html: cleanRichText(activity.description) }}
          />
        </div>
      </article>
    </SpotlightCard>
  );
}

export default async function ActivitiesPage() {
  const { items } = await getActivities();
  const activities = [...items].sort((a, b) => activityTime(b) - activityTime(a));
  const upcoming = activities.filter((activity) => statusOf(activity) === "upcoming");

  return (
    <div className="relative pb-10">
      <Aurora className="opacity-60" />
      <PageContainer className="relative">
        <div className="pt-12 sm:pt-16">
          <SectionHeading
            as="h1"
            index="01"
            label="Activities"
            title="What ShutterScape does"
            description="Exhibitions, photography sessions, photowalks and campus challenges organised by the club."
          />
        </div>

        <ScrollReveal duration={0.7}>
          <section
            aria-labelledby="upcoming-heading"
            className="gradient-border relative mb-16 overflow-hidden rounded-card border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-terracotta" />
              </span>
              <PartyPopper className="h-4 w-4 text-terracotta" aria-hidden="true" />
              <h2
                id="upcoming-heading"
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-forest"
              >
                Upcoming
              </h2>
            </div>

            {upcoming.length > 0 ? (
              <div className="mt-6 space-y-6">
                {upcoming.map((activity, index) => (
                  <ScrollReveal key={activity.id} delay={index * 0.08}>
                    <FeaturedActivity activity={activity} />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-display text-2xl font-semibold leading-snug text-text-primary sm:text-3xl">
                    Nothing on the calendar — yet.
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                    No upcoming activities have been announced. Join the
                    ShutterScape WhatsApp community for event updates and photowalk
                    invitations.
                  </p>
                </div>
                <Magnetic strength={0.18} max={6}>
                  <a
                    href={CLUB.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shine-hover group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-forest px-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-hover"
                  >
                    <span className="relative z-10">Join WhatsApp</span>
                    <ArrowUpRight
                      className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </Magnetic>
              </div>
            )}
          </section>
        </ScrollReveal>

        <section aria-labelledby="all-activities-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="all-activities-heading"
                className="font-display text-3xl font-semibold tracking-[-0.03em] text-text-primary sm:text-4xl"
              >
                Club activities
              </h2>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                Newest first · dates shown where documented
              </p>
            </div>
            <Link
              href="/gallery"
              className="link-underline font-mono text-[10px] uppercase tracking-[0.18em] text-forest"
            >
              See the photographs
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="mt-8 rounded-card border border-dashed border-border bg-surface p-10 text-center">
              <h3 className="font-display text-xl font-semibold text-text-primary">
                No activities published yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                Club activities will appear here once they are added by an
                administrator.
              </p>
            </div>
          ) : (
            <ol className="relative mt-12 space-y-8 before:absolute before:bottom-6 before:left-[5px] before:top-6 before:w-px before:bg-gradient-to-b before:from-forest/50 before:via-white/10 before:to-transparent sm:space-y-10 sm:before:left-[7px]">
              {activities.map((activity, index) => (
                <li key={activity.id} className="relative pl-8 sm:pl-12">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-9 h-[11px] w-[11px] rounded-full border-2 border-forest bg-background shadow-[0_0_16px_rgba(110,231,183,0.6)] sm:left-[2px]"
                  />
                  <ScrollReveal delay={Math.min(index, 5) * 0.06} distance={20}>
                    <TimelineCard activity={activity} />
                  </ScrollReveal>
                </li>
              ))}
            </ol>
          )}
        </section>

        <ScrollReveal>
          <section className="gradient-border relative mt-16 overflow-hidden rounded-[24px] border border-white/[0.07] bg-ink p-7 text-text-invert sm:p-10">
            <Aurora className="opacity-60" />
            <div aria-hidden="true" className="grain-overlay pointer-events-none absolute inset-0" />
            <div className="relative grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="eyebrow-invert">Next frame</p>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-text-invert sm:text-3xl">
                  Take part in the{" "}
                  <GradientText className="italic">next activity</GradientText>
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-invert/60">
                  ShutterScape activities are open to GCU students, whether you
                  shoot on a camera or a phone. Join the community to hear about the
                  next exhibition, session or photowalk.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-5 lg:justify-end">
                <Magnetic strength={0.16} max={6}>
                  <a
                    href={CLUB.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shine-hover inline-flex h-11 items-center justify-center gap-2 rounded-full bg-text-invert px-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="relative z-10">Join the group</span>
                    <ArrowUpRight className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </Magnetic>
                <a
                  href={CLUB.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-text-invert/20 px-5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-invert transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/50 hover:text-forest"
                >
                  Instagram
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </PageContainer>
    </div>
  );
}
