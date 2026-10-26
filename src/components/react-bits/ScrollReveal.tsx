"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds of delay, handy for staggering siblings. */
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right";
  blur?: boolean;
  once?: boolean;
  amount?: number;
}

const OFFSETS: Record<NonNullable<ScrollRevealProps["direction"]>, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

/**
 * Fade + slide + de-blur on first scroll into view.
 * One IntersectionObserver per instance, GPU-friendly properties only.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.75,
  distance = 26,
  direction = "up",
  blur = true,
  once = true,
  amount = 0.2,
}) => {
  const reduced = useReducedMotion();
  const offset = OFFSETS[direction];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{
        opacity: 0,
        x: offset.x * distance,
        y: offset.y * distance,
        filter: blur ? "blur(10px)" : "blur(0px)",
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};
