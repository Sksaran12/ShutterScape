import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "forest" | "terracotta" | "neutral" | "upcoming" | "past" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
  className,
}) => {
  const baseStyles =
    "inline-flex select-none items-center rounded-full border font-mono font-medium uppercase tracking-[0.14em] backdrop-blur-sm";

  const sizeStyles = {
    sm: "px-2.5 py-1 text-[9px]",
    md: "px-3 py-1.5 text-[10px]",
  };

  const variantStyles = {
    forest: "border-forest/30 bg-forest/10 text-forest",
    terracotta: "border-terracotta/30 bg-terracotta/10 text-terracotta",
    neutral: "border-white/10 bg-white/[0.04] text-text-secondary",
    upcoming: "border-status-success/30 bg-status-success/10 text-status-success",
    past: "border-white/10 bg-white/[0.03] text-text-muted",
    outline: "border-border bg-transparent text-text-secondary",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
    >
      {children}
    </span>
  );
};
