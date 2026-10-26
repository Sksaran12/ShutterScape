import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds for a full loop. Lower is faster. */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  fade?: boolean;
}

/**
 * CSS-only infinite marquee (no JS, no layout thrash). The content is rendered
 * twice and translated by exactly 50%, so the loop is seamless.
 */
export const Marquee: React.FC<MarqueeProps> = ({
  children,
  className,
  duration = 46,
  reverse = false,
  pauseOnHover = true,
  fade = true,
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        fade && "edge-fade-x",
        pauseOnHover && "pause-on-hover",
        className
      )}
    >
      <div
        className="flex w-max animate-marquee items-stretch"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-stretch gap-4 pr-4">{children}</div>
        <div className="flex shrink-0 items-stretch gap-4 pr-4" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};
