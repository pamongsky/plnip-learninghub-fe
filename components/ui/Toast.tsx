"use client";

import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type ToastType = "success" | "error" | "info";

export type ToastState = {
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastProps = ToastState & {
  onClose: () => void;
};

const typeStyles: Record<ToastType, { bg: string; text: string; ring: string }> = {
  success: {
    bg: "bg-green-50",
    text: "text-green-800",
    ring: "ring-green-200",
  },
  error: {
    bg: "bg-red-50",
    text: "text-red-800",
    ring: "ring-red-200",
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    ring: "ring-blue-200",
  },
};

const typeIcon: Record<ToastType, React.ReactElement> = {
  success: <CheckCircleIcon className="h-5 w-5" />,
  error: <ExclamationTriangleIcon className="h-5 w-5" />,
  info: <InformationCircleIcon className="h-5 w-5" />,
};

export function Toast({ type, message, onClose, actionLabel, onAction }: ToastProps) {
  const styles = typeStyles[type];

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm px-4 sm:px-0">
      <div
        className={`rounded-xl shadow-lg ring-1 ${styles.bg} ${styles.ring} p-4`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <span className={`${styles.text}`}>{typeIcon[type]}</span>
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className={`mt-3 inline-flex items-center text-xs font-semibold ${styles.text} hover:underline`}
              >
                {actionLabel}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close notification"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
