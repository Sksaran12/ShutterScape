"use client";

import React, { useCallback, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** How strongly the element follows the cursor (0.1–0.5 feels best). */
  strength?: number;
  /** Maximum travel in pixels. */
  max?: number;
}

/** ReactBits-style magnetic hover: the child leans toward the pointer. */
export const Magnetic: React.FC<MagneticProps> = ({
  children,
  className,
  strength = 0.22,
  max = 9,
}) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 240, damping: 18, mass: 0.4 });

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const offsetX = (event.clientX - (rect.left + rect.width / 2)) * strength;
      const offsetY = (event.clientY - (rect.top + rect.height / 2)) * strength;
      x.set(Math.max(-max, Math.min(max, offsetX)));
      y.set(Math.max(-max, Math.min(max, offsetY)));
    },
    [max, strength, x, y]
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
