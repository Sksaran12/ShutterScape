"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoFrameProps {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  /** Wrapper classes (aspect ratio is set with the `aspect` prop). */
  className?: string;
  /** Classes for the <img>, e.g. object position. */
  imgClassName?: string;
  /** CSS aspect-ratio string, e.g. "4 / 3" or "3 / 4". */
  aspect?: string;
  /** Slow zoom while a parent `.group` is hovered. */
  zoomOnHover?: boolean;
}

/**
 * Consistent photo container: reserved aspect ratio (no layout shift),
 * a studio shimmer while loading, a soft fade-in, and an accessible fallback.
 */
export const PhotoFrame: React.FC<PhotoFrameProps> = ({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  className,
  imgClassName,
  aspect = "4 / 3",
  zoomOnHover = true,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Images served from cache can finish before React attaches onLoad.
  useEffect(() => {
    const node = imgRef.current;
    if (!node) return;
    if (node.complete) {
      if (node.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-background-tertiary ring-1 ring-inset ring-white/[0.06]",
        className
      )}
      style={{ aspectRatio: aspect }}
    >
      {!loaded && !failed && (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#14181f] via-[#0e1015] to-[#191d26]" />
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>
      )}

      {failed ? (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-background-tertiary px-3 text-center text-text-muted"
        >
          <ImageOff className="h-6 w-6" aria-hidden="true" />
          <span className="text-[11px] leading-snug">Image unavailable</span>
        </div>
      ) : (
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-[1200ms] ease-editorial",
            zoomOnHover && "group-hover:scale-[1.055]"
          )}
        >
          <Image
            ref={imgRef}
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "object-cover transition-[opacity,filter,transform] duration-700",
              loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
              imgClassName
            )}
          />
        </div>
      )}
    </div>
  );
};
