"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastState } from "@/components/ui/Toast";

type ToastOptions = {
  duration?: number;
};

export function useToast(options: ToastOptions = {}) {
  const { duration = 4000 } = options;
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (nextToast: ToastState) => {
      setToast(nextToast);
      if (duration > 0) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setToast(null);
          timerRef.current = null;
        }, duration);
      }
    },
    [duration]
  );

  useEffect(() => clearToast, [clearToast]);

  return { toast, showToast, clearToast };
}
