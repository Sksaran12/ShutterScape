import { GraduationCap, History, Users, type LucideIcon } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { ScrollReveal } from "@/components/react-bits/ScrollReveal";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { Aurora } from "@/components/react-bits/Aurora";
import { GradientText } from "@/components/react-bits/GradientText";
import { getMembers, groupMembersByCategory } from "@/lib/content";
import type { MemberRecord } from "@/lib/content-types";
import { FOUNDING_ALUMNI_NAMES } from "@/lib/seed-data";

function Portrait({
  member,
  aspect = "4 / 5",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px",
  imgClassName,
}: {
  member: MemberRecord;
  aspect?: string;
  sizes?: string;
  imgClassName?: string;
}) {
  if (!member.portraitUrl) {
    return (
      <div
        role="img"
        aria-label={member.altText}
        className="flex w-full items-center justify-center bg-background-secondary font-display text-3xl text-text-muted"
        style={{ aspectRatio: aspect }}
      >
        {member.fullName
          .split(" ")
          .slice(0, 2)
          .map((part) => part[0])
          .join("")}
      </div>
    );
  }

  return (
    <PhotoFrame
      src={member.portraitUrl}
      alt={member.altText}
      aspect={aspect}
      sizes={sizes}
      imgClassName={`object-top ${imgClassName ?? ""}`}
      className="w-full rounded-frame"
      zoomOnHover
    />
  );
}

function PersonCard({
  member,
  showRole = true,
  compact = false,
}: {
  member: MemberRecord;
  showRole?: boolean;
  compact?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[14px] border border-white/[0.08] bg-surface p-1.5 shadow-editorial transition-all duration-500 ease-editorial group-hover:-translate-y-1.5 group-hover:border-forest/30 group-hover:shadow-hover sm:p-2">
        <Portrait
          member={member}
          sizes={
            compact
              ? "(max-width: 640px) 45vw, 220px"
              : "(max-width: 640px) 80vw, (max-width: 1024px) 33vw, 280px"
          }
          imgClassName="grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[14px] bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>

      <div className={compact ? "px-1 pt-3" : "px-1 pt-4"}>
        {showRole && (
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-terracotta">
            {member.role}
          </p>
        )}
        <h3
          className={`font-display font-semibold leading-snug text-text-primary transition-colors group-hover:text-forest ${
            compact ? "mt-1 text-base" : "mt-1.5 text-lg sm:text-xl"
          }`}
        >
          {member.fullName}
        </h3>
        {member.department && (
          <p className="mt-1.5 text-xs leading-relaxed text-text-muted">
            {member.department}
          </p>
        )}
        {member.biography && !compact && (
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            {member.biography}
          </p>
        )}
      </div>
    </article>
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-forest">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-forest/25 bg-forest/10">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      {children}
    </p>
  );
}

export default async function AboutPage() {
  const { items } = await getMembers();
  const groups = groupMembersByCategory(items);

  const foundingAlumni = groups.alumni.filter((member) =>
    (FOUNDING_ALUMNI_NAMES as readonly string[]).includes(member.fullName)
  );

  return (
    <div className="relative pb-10">
      <Aurora className="opacity-60" />
      <PageContainer className="relative">
        <div className="pt-12 sm:pt-16">
          <SectionHeading
            as="h1"
            index="01"
            label="About the club"
            title="ShutterScape, Girijananda Choudhury University"
            description="A community for students who enjoy observing, capturing and telling stories through photography."
          />
        </div>

        {/* Introduction */}
        <ScrollReveal>
          <section className="gradient-border overflow-hidden rounded-card border border-white/[0.07] bg-surface/70 p-6 shadow-editorial sm:p-10">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="space-y-4 lg:col-span-7">
                <p className="text-pretty text-base leading-relaxed text-text-secondary sm:text-lg">
                  ShutterScape is the photography club of Girijananda Choudhury
                  University, created for students who love to observe, capture and
                  tell stories through photographs.
                </p>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  Whether you are a professional photographer or someone who simply
                  loves clicking pictures on your phone — there&apos;s a place for
                  you here. The club is a space to learn, create, collaborate,
                  experiment and showcase visual work.
                </p>
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  Sessions are informal: someone brings a camera, someone brings a
                  phone, and everyone leaves with a new way of looking at campus.
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="polaroid -rotate-[1.5deg]">
                  <PhotoFrame
                    src="/assets/photos/world-photography-day-2026-4.jpg"
                    alt="ShutterScape members and faculty at the World Photography Day exhibition"
                    aspect="4 / 3"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                    className="rounded-frame"
                  />
                  <p className="px-1 pb-0.5 pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                    World Photography Day exhibition · GCU
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-6 text-xs sm:grid-cols-4">
              {[
                { label: "Founded", value: "2023" },
                { label: "Based at", value: "GCU, Azara" },
                { label: "Open to", value: "All students" },
                { label: "Gear", value: "Phone or camera" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-forest/25"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1.5 font-display text-lg font-semibold text-text-primary">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* History */}
        <section className="mt-20 scroll-mt-24 sm:mt-24" id="history">
          <ScrollReveal>
            <SectionLabel icon={History}>Club history</SectionLabel>
            <h2 className="mt-3 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-text-primary text-balance">
              Where it all started —{" "}
              <GradientText className="italic">the beginning, 2023</GradientText>
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="space-y-4 lg:col-span-7">
              <ScrollReveal delay={0.08}>
                <p className="text-pretty text-base leading-relaxed text-text-secondary sm:text-lg">
                  ShutterScape was first introduced in 2023 by our alumni,{" "}
                  <strong className="font-semibold text-text-primary">
                    Dheemaan Deka
                  </strong>{" "}
                  and{" "}
                  <strong className="font-semibold text-text-primary">
                    Subhrajyoti Goswami
                  </strong>
                  .
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.14}>
                <p className="text-base leading-relaxed text-text-secondary sm:text-lg">
                  What began as an idea became a space where students could explore
                  photography, creativity and visual storytelling. Today, that
                  vision continues with new people, new ideas and new perspectives.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <blockquote className="gradient-border mt-6 rounded-card border border-white/[0.07] bg-surface/60 p-6">
                  <p className="font-display text-2xl italic leading-snug text-text-primary">
                    “Someone brings a camera, someone brings a phone, and everyone
                    leaves with a new way of looking.”
                  </p>
                </blockquote>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:col-span-5">
              {foundingAlumni.length > 0 ? (
                foundingAlumni.map((member, index) => (
                  <ScrollReveal key={member.id} delay={0.1 + index * 0.08}>
                    <PersonCard member={member} compact />
                  </ScrollReveal>
                ))
              ) : (
                <div className="col-span-2 rounded-card border border-dashed border-border bg-surface p-6 text-sm text-text-secondary">
                  Dheemaan Deka and Subhrajyoti Goswami introduced ShutterScape in
                  2023.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Faculty */}
        <section className="mt-20 sm:mt-24">
          <ScrollReveal>
            <SectionLabel icon={GraduationCap}>Faculty coordination</SectionLabel>
            <h2 className="mt-3 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-text-primary text-balance">
              The teachers who <GradientText className="italic">guide us</GradientText>
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {groups.faculty.map((member, index) => (
              <ScrollReveal key={member.id} delay={index * 0.08}>
                <SpotlightCard
                  className="card-surface"
                  spotlightColor="rgba(251, 146, 60, 0.12)"
                >
                  <article className="group flex items-start gap-5 p-4 sm:p-6">
                    <div className="w-24 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-surface p-1 sm:w-32">
                      <Portrait
                        member={member}
                        aspect="3 / 4"
                        sizes="(max-width: 640px) 96px, 128px"
                        imgClassName="grayscale transition-all duration-700 group-hover:grayscale-0"
                      />
                    </div>
                    <div className="min-w-0 pt-1">
                      <Badge variant="forest">{member.role}</Badge>
                      <h3 className="mt-2.5 font-display text-xl font-semibold text-text-primary transition-colors group-hover:text-forest">
                        {member.fullName}
                      </h3>
                      {member.department && (
                        <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                          {member.department}
                        </p>
                      )}
                    </div>
                  </article>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Leadership */}
        <section className="mt-20 sm:mt-24">
          <ScrollReveal>
            <SectionLabel icon={Users}>Current leadership</SectionLabel>
            <h2 className="mt-3 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-text-primary text-balance">
              Meet the people{" "}
              <GradientText className="italic">behind the lens</GradientText>
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {groups.leadership.map((member, index) => (
              <ScrollReveal key={member.id} delay={Math.min(index, 4) * 0.07}>
                <PersonCard member={member} />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Core Members */}
        <section className="mt-20 sm:mt-24">
          <ScrollReveal>
            <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.6rem)] font-semibold tracking-[-0.03em] text-text-primary">
              Core members
            </h2>
          </ScrollReveal>

          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {groups.core.map((member, index) => (
              <ScrollReveal key={member.id} delay={Math.min(index, 5) * 0.05}>
                <PersonCard member={member} showRole={false} compact />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Alumni */}
        <section className="mt-20 border-t border-white/[0.07] pt-12 sm:mt-24">
          <ScrollReveal>
            <h2 className="max-w-3xl font-display text-[clamp(1.7rem,3.6vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em] text-text-primary text-balance">
              The students who{" "}
              <GradientText className="italic">carried it forward</GradientText>
            </h2>
          </ScrollReveal>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {groups.alumni.map((member, index) => (
              <ScrollReveal key={member.id} delay={Math.min(index, 4) * 0.06}>
                <PersonCard member={member} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
