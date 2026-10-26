"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * Hover spotlight written to CSS custom properties inside a rAF callback.
 * Moving the pointer does not trigger React renders.
 */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor = "rgba(49, 87, 68, 0.09)",
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || frameRef.current) return;
      const { clientX, clientY } = event;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = 0;
        const element = cardRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--spotlight-x", `${clientX - rect.left}px`);
        element.style.setProperty("--spotlight-y", `${clientY - rect.top}px`);
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative overflow-hidden rounded-card ${className}`}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${spotlightColor}, transparent 42%)`,
        }}
      />
      {children}
    </div>
  );
};
