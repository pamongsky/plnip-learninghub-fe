import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import api from "@/lib/axios";

export default function MoodleLoginButton({
  className,
}: {
  className?: string;
}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Moodle Local URL provided by user
  const MOODLE_URL = "http://localhost/moodle45-oracle";

  const handleMoodleLogin = async () => {
    setIsLoading(true);
    try {
      // "True SSO" via Backend Magic Link
      // 1. Ask backend for a unique Login URL
      const response = await api.post("/moodle/login-url");

      if (response.data.success && response.data.login_url) {
        // 2. Redirect user to that Magic Link
        // The link contains a one-time key that logs them in automatically.
        window.open(response.data.login_url, "_blank");
      } else {
        throw new Error(response.data.message || "Invalid response");
      }
    } catch (error: any) {
      console.error("Moodle SSO error:", error);
      alert(
        `Gagal menghubungkan ke Moodle otomatis: ${
          error.response?.data?.message || error.message
        }. Pastikan akun Anda sudah terdaftar di Moodle.`,
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
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-b-white rounded-full animate-spin" />
      ) : (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/c6/Moodle-logo.svg"
          alt="Moodle"
          className="h-5 w-auto brightness-0 invert"
        />
      )}
      <span>Akses LMS Moodle</span>
      <ArrowRightOnRectangleIcon className="w-4 h-4" />
    </button>
  );
}
