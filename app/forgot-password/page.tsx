"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/forgot-password/request-otp", {
        email,
      });

      if (response.data.success) {
        // Store email for next step
        sessionStorage.setItem("reset_email", email);
        sessionStorage.setItem("reset_email_masked", response.data.email_masked);

        // Redirect to OTP verification page
        router.push("/forgot-password/verify-otp");
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (err as { message?: string }).message ||
          "Terjadi kesalahan. Silakan coba lagi."
        : "Terjadi kesalahan. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-pln-primary transition mb-6"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Kembali ke Login
            </Link>

            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pln-primary to-pln-light rounded-2xl flex items-center justify-center">
                <EnvelopeIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 text-center">
              Lupa Password?
            </h1>
            <p className="text-slate-500 text-center mt-2 text-sm">
              Masukkan email Anda untuk menerima kode OTP
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
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary transition text-slate-800"
                  placeholder="your.email@plnip.co.id"
                />
                <EnvelopeIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
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
                  Mengirim...
                </span>
              ) : (
                "Kirim Kode OTP"
              )}
            </button>
          </form>

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
