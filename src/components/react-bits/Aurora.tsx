import React from "react";
import { cn } from "@/lib/utils";

interface AuroraProps {
  className?: string;
}

/**
 * Soft, CSS-only aurora lighting. Three blurred colour fields drift at
 * different speeds behind the content — no canvas, no layout thrash.
 */
export const Aurora: React.FC<AuroraProps> = ({ className }) => (
  <div
    aria-hidden="true"
    className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
  >
    <span className="absolute -left-[10%] top-[-18%] h-[34rem] w-[34rem] rounded-full bg-forest/[0.14] blur-[130px] animate-aurora" />
    <span
      className="absolute right-[-12%] top-[2%] h-[30rem] w-[30rem] rounded-full bg-terracotta/[0.12] blur-[140px] animate-aurora"
      style={{ animationDelay: "-6s", animationDuration: "24s" }}
    />
    <span
      className="absolute bottom-[-24%] left-[32%] h-[26rem] w-[26rem] rounded-full bg-[#8AB4FF]/[0.08] blur-[150px] animate-aurora"
      style={{ animationDelay: "-12s", animationDuration: "30s" }}
    />
  </div>
);
