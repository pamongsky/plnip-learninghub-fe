"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if reset token exists
    const resetToken = sessionStorage.getItem("reset_token");
    if (!resetToken) {
      router.push("/forgot-password");
    }
  }, [router]);

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: "", color: "" };
    if (pwd.length < 8) return { strength: "Lemah", color: "text-red-600" };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { strength: "Lemah", color: "text-red-600" };
    if (score === 3) return { strength: "Sedang", color: "text-yellow-600" };
    return { strength: "Kuat", color: "text-green-600" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      const resetToken = sessionStorage.getItem("reset_token");

      const response = await axios.post("/forgot-password/reset", {
        reset_token: resetToken,
        new_password: password,
        new_password_confirmation: passwordConfirmation,
      });

      if (response.data.success) {
        setSuccess(true);

        // Clear session storage
        sessionStorage.removeItem("reset_email");
        sessionStorage.removeItem("reset_phone");
        sessionStorage.removeItem("reset_token");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          (err as { message?: string }).message ||
          "Gagal mengubah password. Silakan coba lagi."
        : "Gagal mengubah password. Silakan coba lagi.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-pln-dark to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center max-w-md mx-4"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Password Berhasil Diubah!
          </h2>
          <p className="text-slate-600 mb-6">
            Password Anda telah berhasil diperbarui. Silakan login dengan
            password baru.
          </p>
          <p className="text-sm text-slate-500">
            Mengarahkan ke halaman login...
          </p>
        </motion.div>
      </div>
    );
  }

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
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pln-primary to-pln-light rounded-2xl flex items-center justify-center">
                <KeyIcon className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 text-center">
              Buat Password Baru
            </h1>
            <p className="text-slate-500 text-center mt-2 text-sm">
              Password harus minimal 8 karakter
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
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary transition text-slate-800"
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === "Kuat"
                          ? "bg-green-500 w-full"
                          : passwordStrength.strength === "Sedang"
                          ? "bg-yellow-500 w-2/3"
                          : "bg-red-500 w-1/3"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${passwordStrength.color}`}
                  >
                    {passwordStrength.strength}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="password-confirm"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="password-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary transition text-slate-800"
                  placeholder="Ketik ulang password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {passwordConfirmation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  {password === passwordConfirmation ? (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Password cocok
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      Password tidak cocok
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                password.length < 8 ||
                password !== passwordConfirmation
              }
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
                  Menyimpan...
                </span>
              ) : (
                "Reset Password"
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
