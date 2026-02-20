import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { twMerge } from "tailwind-merge";

export default function MoodleLoginButton({
  className,
  roleId,
}: {
  className?: string;
  roleId?: number;
}) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const downloadCredentials = async () => {
    try {
      const response = await api.post("/moodle/credentials");
      if (response.data.success && response.data.html_content) {
        const blob = new Blob([response.data.html_content], {
          type: "text/html",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.data.filename || "Akun_LMS_Moodle.html";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Dokumen akses akun manual berhasil diunduh otomatis.");
      }
    } catch (e) {
      console.error("Gagal download credentials", e);
    }
  };

  const handleMoodleLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Get Login URL & Check Download Status
      const response = await api.post("/moodle/login-url", { role_id: roleId });

      if (response.data.success && response.data.login_url) {
        // 2. Auto Download Credentials (One-Time-Only)
        if (response.data.should_download_creds) {
          toast.info(
            "Login pertama kali terdeteksi. Menyiapkan dokumen akun manual...",
          );
          downloadCredentials(); // Async (gak nunggu redirect)
        }

        // 3. Redirect to Moodle
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        toast.success("Mengarahkan ke LMS Moodle...");

        // Delay sedikit agar toast terbaca & download start
        setTimeout(() => {
          if (isMobile) {
            window.location.href = response.data.login_url;
          } else {
            window.open(response.data.login_url, "_blank");
          }
        }, 1000);
      } else {
        throw new Error(response.data.message || "Invalid response");
      }
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message ||
            (error as { message?: string }).message ||
            "Terjadi kesalahan"
          : "Terjadi kesalahan";

      toast.error(`Gagal menghubungkan ke Moodle: ${errorMessage}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMoodleLogin}
      disabled={isLoading}
      className={twMerge(
        "flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      {isLoading && (
        <div className="w-5 h-5 border-2 border-white/30 border-b-white rounded-full animate-spin" />
      )}
      <span>Akses LMS Moodle</span>
      <ArrowRightOnRectangleIcon className="w-4 h-4" />
    </button>
  );
}
