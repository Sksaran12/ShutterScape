import React from "react";
import { cn } from "@/lib/utils";
import { PageContainerProps } from "@/types";

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  as: Component = "div",
}) => {
  return (
    <Component
      className={cn(
        "w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </Component>
  );
};
