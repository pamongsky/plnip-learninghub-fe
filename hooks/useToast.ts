import { useState, useCallback } from "react";
import type { ToastState } from "@/components/ui/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((toastData: ToastState) => {
    setToast(toastData);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    clearToast,
  };
}
