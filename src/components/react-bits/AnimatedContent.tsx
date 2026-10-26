"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedContentProps {
  children: React.ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

export const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 24,
  direction = "vertical",
  reverse = false,
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const axis = direction === "horizontal" ? "x" : "y";
  const offset = reverse ? -distance : distance;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, [axis]: offset }}
      animate={inView ? { opacity: 1, [axis]: 0 } : { opacity: 0, [axis]: offset }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Editorial bezier curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
