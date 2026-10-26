"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 50,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
}) => {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>;
  }

  const defaultFrom =
    direction === "top"
      ? { filter: "blur(8px)", opacity: 0, y: -16 }
      : { filter: "blur(8px)", opacity: 0, y: 16 };

  const defaultTo = {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
  };

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {elements.map((element, i) => (
        <React.Fragment key={i}>
          <motion.span
            initial={defaultFrom}
            animate={inView ? defaultTo : defaultFrom}
            transition={{
              duration: 0.5,
              delay: (i * delay) / 1000,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block"
          >
            {element}
          </motion.span>
          {/* A real space keeps the line wrappable on narrow viewports. */}
          {animateBy === "words" && i < elements.length - 1 && " "}
        </React.Fragment>
      ))}
    </span>
  );
};
