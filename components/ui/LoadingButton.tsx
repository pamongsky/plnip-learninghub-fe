"use client";

import React from "react";
import { Spinner } from "./Spinner";

type LoadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
};

export function LoadingButton({
  loading = false,
  loadingText,
  disabled,
  className = "",
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 ${className}`}
    >
      {loading && <Spinner className="h-4 w-4" />}
      <span>{loading ? loadingText ?? children : children}</span>
    </button>
  );
}
