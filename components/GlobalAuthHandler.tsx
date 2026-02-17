"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Listens for global auth events dispatched by the axios interceptor:
 * - api:forbidden (403): show error toast without redirecting
 */
export default function GlobalAuthHandler() {
  useEffect(() => {
    const handleForbidden = (e: Event) => {
      const message =
        (e as CustomEvent).detail ||
        "Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.";
      toast.error(message, { duration: 4000 });
    };

    window.addEventListener("api:forbidden", handleForbidden);
    return () => window.removeEventListener("api:forbidden", handleForbidden);
  }, []);

  return null;
}
