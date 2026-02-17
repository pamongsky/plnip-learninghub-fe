"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [email, setEmail] = useState("");
  const [emailMasked, setEmailMasked] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem("reset_email");
    const storedEmailMasked = sessionStorage.getItem("reset_email_masked");

    if (!storedEmail) {
      router.push("/forgot-password");
      return;
    }

    setEmail(storedEmail);
    setEmailMasked(storedEmailMasked || storedEmail);

    // Focus first input
    inputRefs.current[0]?.focus();
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace: go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);

    // Focus last filled input
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/forgot-password/verify-otp", {
        email,
        otp_code: otpCode,
      });

      if (response.data.success) {
        // Store reset token for next step
        sessionStorage.setItem("reset_token", response.data.reset_token);

        // Redirect to reset password page
        router.push("/forgot-password/reset");
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (err as { message?: string }).message ||
          "Kode OTP salah. Silakan coba lagi."
        : "Kode OTP salah. Silakan coba lagi.";
      setError(errorMessage);
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await axios.post("/forgot-password/request-otp", { email });
      setTimeLeft(300); // Reset timer
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (err as { message?: string }).message ||
          "Gagal mengirim ulang OTP"
        : "Gagal mengirim ulang OTP";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-pln-dark to-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.05),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(0,156,222,0.1),transparent_40%)]" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
        >
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-pln-primary transition mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Kembali
            </Link>

            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pln-primary to-pln-light rounded-2xl flex items-center justify-center">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 text-center">
              Verifikasi Kode OTP
            </h1>
            <p className="text-slate-500 text-center mt-2 text-sm">
              Kode OTP telah dikirim ke email{" "}
              <span className="font-semibold text-slate-700">
                {emailMasked}
              </span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Boxes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                Masukkan Kode OTP
              </label>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary transition text-slate-800"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <p
                className={`text-sm ${
                  timeLeft > 0 ? "text-slate-600" : "text-red-600"
                }`}
              >
                {timeLeft > 0 ? (
                  <>
                    Kode berlaku selama{" "}
                    <span className="font-semibold">{formatTime(timeLeft)}</span>
                  </>
                ) : (
                  "Kode sudah kadaluarsa"
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full bg-gradient-to-r from-pln-primary to-pln-light text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-pln-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memverifikasi...
                </span>
              ) : (
                "Verifikasi"
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Tidak menerima email?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || timeLeft > 240} // Can resend after 1 minute
                className="text-pln-primary hover:text-pln-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim ulang
              </button>
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              Butuh bantuan?{" "}
              <a
                href="mailto:hcis@plnip.co.id"
                className="text-pln-primary hover:underline"
              >
                Hubungi HCIS
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/50 text-xs">
          © 2026 PT PLN Indonesia Power. All rights reserved.
        </p>
      </div>
    </div>
  );
}
