import React from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative my-8 flex flex-col items-center justify-center overflow-hidden rounded-card border border-dashed border-border bg-surface/50 p-12 text-center",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-forest/25 bg-forest/10 text-forest shadow-glow">
        {icon || <Camera className="h-6 w-6 stroke-[1.5]" />}
      </div>
      <h3 className="relative font-display text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest underline decoration-forest/40 underline-offset-4 transition-colors hover:text-forest-hover"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
