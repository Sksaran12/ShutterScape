import React from "react";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/types";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "shine-hover group inline-flex select-none items-center justify-center rounded-full font-semibold uppercase tracking-[0.12em] transition-all duration-300 ease-editorial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

    const sizeStyles = {
      sm: "h-9 gap-1.5 px-4 text-[10px]",
      md: "h-11 gap-2 px-5 text-[11px]",
      lg: "h-12 gap-2.5 px-7 text-xs",
    };

    const variantStyles = {
      primary:
        "bg-forest text-ink shadow-glow hover:-translate-y-0.5 hover:bg-forest-hover active:translate-y-0",
      secondary:
        "border border-border bg-surface-elevated text-text-primary hover:-translate-y-0.5 hover:border-forest/40 hover:bg-surface-hover",
      outline:
        "border border-border bg-transparent text-text-primary hover:border-forest/60 hover:text-forest",
      ghost:
        "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon
        )}
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
