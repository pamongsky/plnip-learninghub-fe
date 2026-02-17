import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function MoodleLoginButton({
  className,
}: {
  className?: string;
}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodleLogin = async () => {
    setIsLoading(true);
    try {
      // "True SSO" via Backend Magic Link
      // 1. Ask backend for a unique Login URL
      const response = await api.post("/moodle/login-url");

      if (response.data.success && response.data.login_url) {
        // 2. Redirect user to that Magic Link
        // The link contains a one-time key that logs them in automatically.
        // Use window.location.href for better mobile compatibility (no popup blocker)
        // If you want new tab, use window.open but it might be blocked on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          // Mobile: Open in same tab (better UX, no popup blocker)
          window.location.href = response.data.login_url;
        } else {
          // Desktop: Open in new tab
          window.open(response.data.login_url, "_blank");
        }
      } else {
        throw new Error(response.data.message || "Invalid response");
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (error as { message?: string }).message ||
          "Terjadi kesalahan"
        : "Terjadi kesalahan";

      toast.error(
        `Gagal menghubungkan ke Moodle: ${errorMessage}. Pastikan akun Anda sudah terdaftar di Moodle.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMoodleLogin}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading && (
        <div className="w-5 h-5 border-2 border-white/30 border-b-white rounded-full animate-spin" />
      )}
      <span>Akses LMS Moodle</span>
      <ArrowRightOnRectangleIcon className="w-4 h-4" />
    </button>
  );
}
