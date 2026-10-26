"use client";

import React, { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackClassName?: string;
}

/**
 * Next/Image with a visible, accessible fallback instead of a broken image
 * icon when an asset is missing or fails to decode.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  alt,
  className,
  fallbackClassName = "",
  ...props
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-background-tertiary px-3 text-center text-text-muted ${fallbackClassName}`}
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
        <span className="text-[11px] leading-snug">Image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
};
