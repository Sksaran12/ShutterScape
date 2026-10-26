import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load content",
  message = "An error occurred while retrieving this section. Please try again.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "my-8 flex flex-col items-center justify-center rounded-card border border-status-error/25 bg-status-error/[0.06] p-10 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-status-error/30 bg-status-error/10 text-status-error">
        <AlertCircle className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h3 className="font-display text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mb-6 mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
