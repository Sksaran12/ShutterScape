import React from "react";
import { cn } from "@/lib/utils";
import { SectionHeadingProps } from "@/types";
import { ScrollReveal } from "@/components/react-bits/ScrollReveal";
import { GradientText } from "@/components/react-bits/GradientText";

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  label,
  title,
  description,
  align = "left",
  className,
  index,
  tone = "light",
  as: Heading = "h2",
}) => {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "mb-10 lg:mb-14",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl",
        className
      )}
    >
      <ScrollReveal duration={0.7}>
        {(index || label) && (
          <div
            className={cn(
              "flex items-center gap-3",
              align === "center" && "justify-center"
            )}
          >
            {index && (
              <span
                className={cn(
                  "inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 font-mono text-[10px] tabular-nums",
                  dark
                    ? "border-terracotta/30 bg-terracotta/10 text-terracotta"
                    : "border-forest/30 bg-forest/10 text-forest"
                )}
              >
                {index}
              </span>
            )}
            {label && (
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.28em] sm:text-[11px]",
                  dark ? "text-terracotta" : "text-forest"
                )}
              >
                {label}
              </span>
            )}
          </div>
        )}

        <Heading
          className={cn(
            "mt-5 font-display text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-balance",
            dark ? "text-text-invert" : "text-text-primary"
          )}
        >
          {dark ? title : <GradientText animated={false}>{title}</GradientText>}
        </Heading>

        {description && (
          <p
            className={cn(
              "mt-4 max-w-2xl text-pretty text-sm leading-relaxed sm:text-base",
              align === "center" && "mx-auto",
              dark ? "text-text-invert/60" : "text-text-secondary"
            )}
          >
            {description}
          </p>
        )}

        <span
          aria-hidden="true"
          className={cn(
            "mt-6 block h-px w-24 bg-gradient-to-r",
            align === "center" && "mx-auto",
            dark
              ? "from-terracotta/70 to-transparent"
              : "from-forest/70 to-transparent"
          )}
        />
      </ScrollReveal>
    </div>
  );
};
