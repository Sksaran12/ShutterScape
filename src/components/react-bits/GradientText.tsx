import React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

/** Animated studio-gradient text for headline emphasis. */
export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className,
  animated = true,
}) => (
  <span
    className={cn(
      "inline-block bg-clip-text text-transparent",
      animated ? "text-gradient-animated" : "text-gradient",
      className
    )}
  >
    {children}
  </span>
);
