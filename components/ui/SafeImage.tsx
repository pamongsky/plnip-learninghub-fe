"use client";

import { useState } from "react";
import Image from "next/image";
import { PhotoIcon } from "@heroicons/react/24/outline";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  priority?: boolean;
  onError?: () => void;
}

/**
 * Safe image component with automatic fallback handling
 * - Shows fallback image if src is null/undefined
 * - Shows fallback if image fails to load
 * - Shows placeholder icon as last resort
 */
export default function SafeImage({
  src,
  alt,
  fallbackSrc,
  className = "",
  width,
  height,
  fill = false,
  objectFit = "cover",
  priority = false,
  onError,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(src || fallbackSrc || null);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // If we have a fallback and haven't tried it yet
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      // No fallback or fallback also failed, show placeholder
      setHasError(true);
    }

    if (onError) {
      onError();
    }
  };

  // If no valid image source or error occurred, show placeholder
  if (hasError || !imgSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 ${className}`}
        style={width && height && !fill ? { width, height } : undefined}
      >
        <div className="text-center">
          <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {alt || "Gambar tidak tersedia"}
          </p>
        </div>
      </div>
    );
  }

  // Render image with error handling
  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        style={{ objectFit }}
        onError={handleError}
        priority={priority}
        unoptimized={imgSrc.startsWith("http") && !imgSrc.includes(process.env.NEXT_PUBLIC_BACKEND_URL || "")}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      style={{ objectFit }}
      onError={handleError}
      priority={priority}
      unoptimized={imgSrc.startsWith("http") && !imgSrc.includes(process.env.NEXT_PUBLIC_BACKEND_URL || "")}
    />
  );
}
