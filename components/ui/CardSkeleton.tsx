"use client";

import React from "react";
import { Skeleton } from "./Skeleton";

type CardSkeletonProps = {
  className?: string;
  showImage?: boolean;
  lines?: number;
};

export function CardSkeleton({
  className = "",
  showImage = true,
  lines = 2,
}: CardSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${className}`}>
      {showImage && <Skeleton className="h-32 w-full mb-4" />}
      <Skeleton className="h-4 w-3/4 mb-2" />
      {Array.from({ length: Math.max(0, lines) }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-3 ${index === lines - 1 ? "w-1/2" : "w-full"} mt-2`}
        />
      ))}
    </div>
  );
}
