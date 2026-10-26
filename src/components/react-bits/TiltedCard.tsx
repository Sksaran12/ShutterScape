"use client";

import React, { useCallback, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees. Keep it small for editorial restraint. */
  rotate?: number;
  scaleOnHover?: number;
  glare?: boolean;
}

/**
 * ReactBits-style 3D tilt card. Pointer position feeds two springs; the whole
 * interaction runs on the compositor and never triggers a React render.
 */
export const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  className,
  rotate = 7,
  scaleOnHover = 1.015,
  glare = true,
}) => {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 180, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [0, 1], [rotate, -rotate]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-rotate, rotate]), spring);
  const scale = useSpring(1, spring);

  const glareX = useTransform(px, (value) => `${value * 100}%`);
  const glareY = useTransform(py, (value) => `${value * 100}%`);
  const glareBackground = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(255,255,255,0.32), transparent 62%)`;

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const element = cardRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      px.set((event.clientX - rect.left) / rect.width);
      py.set((event.clientY - rect.top) / rect.height);
    },
    [px, py]
  );

  const handleEnter = useCallback(() => scale.set(scaleOnHover), [scale, scaleOnHover]);

  const handleLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
    scale.set(1);
  }, [px, py, scale]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 1000 }}
      className={cn("group relative [transform-style:preserve-3d] will-change-transform", className)}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBackground }}
        />
      )}
    </motion.div>
  );
};
