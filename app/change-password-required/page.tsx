"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

export default function ChangePasswordRequiredPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // Password strength validations
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // CRITICAL: Check if user actually needs to change password
  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        // Fetch current user data from backend
        const response = await api.get("/user");
        const userData = response.data.data.user;

        // If user doesn't need to change password, redirect to dashboard
        if (!userData.must_change_password) {
          const userRole = userData.roles?.[0] || "learner";
          const dashboardMap: Record<string, string> = {
            "super-admin": "/superadmin",
            "admin": "/admin",
            "instructor": "/instructor",
            "learner": "/dashboard",
          };
          router.replace(dashboardMap[userRole] || "/dashboard");
        } else {
          setChecking(false);
        }
      } catch (err) {
        // error handled silently
        setChecking(false);
      }
    };

    checkPasswordStatus();
  }, [router]);

  // Check password strength
  useEffect(() => {
    setValidations({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*]/.test(newPassword),
    });
  }, [newPassword]);

  const allValidationsPassed = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Semua field harus diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password baru tidak cocok");
      return;
    }

    if (!allValidationsPassed) {
      setError("Password tidak memenuhi syarat keamanan");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/change-password-first-time", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      // Redirect to dashboard based on role
      const userRole = user?.roles?.[0] || "learner";
      const dashboardMap: Record<string, string> = {
        "super-admin": "/superadmin",
        "admin": "/admin",
        "instructor": "/instructor",
        "learner": "/dashboard",
      };

      router.push(dashboardMap[userRole] || "/dashboard");
    } catch (err: unknown) {
      interface ValidationError {
        response?: {
          data?: {
            message?: string;
            errors?: {
              current_password?: string[];
              new_password?: string[];
            };
          };
        };
      }

      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as ValidationError).response?.data?.message ||
          (err as ValidationError).response?.data?.errors?.current_password?.[0] ||
          (err as ValidationError).response?.data?.errors?.new_password?.[0] ||
          "Gagal mengubah password"
        : "Gagal mengubah password";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Force logout if user tries to cancel
    logout();
    router.push("/login");
  };

  // Show loading state while checking if user needs to change password
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pln-primary via-pln-600 to-pln-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pln-primary to-pln-light rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Memeriksa status akun...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pln-primary via-pln-600 to-pln-light flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pln-primary to-pln-light rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Ganti Password Wajib
            </h1>
            <p className="text-sm text-slate-500">
              Untuk keamanan akun Anda, harap ganti password sebelum melanjutkan
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pln-primary focus:border-transparent"
                  placeholder="Masukkan password saat ini (NIP Anda)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pln-primary focus:border-transparent"
                  placeholder="Masukkan password baru"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pln-primary focus:border-transparent"
                  placeholder="Ketik ulang password baru"
                  required
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
            </div>

            {/* Password Requirements */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700 mb-3">
                Syarat Password:
              </p>
              {[
                { key: "length", label: "Minimal 8 karakter" },
                { key: "uppercase", label: "Minimal 1 huruf besar (A-Z)" },
                { key: "lowercase", label: "Minimal 1 huruf kecil (a-z)" },
                { key: "number", label: "Minimal 1 angka (0-9)" },
                { key: "special", label: "Minimal 1 karakter spesial (!@#$%^&*)" },
              ].map((req) => (
                <div key={req.key} className="flex items-center gap-2">
                  {validations[req.key as keyof typeof validations] ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-slate-300" />
                  )}
                  <span
                    className={`text-xs ${
                      validations[req.key as keyof typeof validations]
                        ? "text-green-700"
                        : "text-slate-500"
                    }`}
                  >
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Batal & Logout
              </button>
              <button
                type="submit"
                disabled={loading || !allValidationsPassed}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pln-primary to-pln-light hover:shadow-lg hover:shadow-pln-primary/30 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Mengubah..." : "Ganti Password"}
              </button>
            </div>
          </form>

          {/* Warning */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-800">
              ⚠️ <strong>Penting:</strong> Jika Anda membatalkan proses ini,
              Anda akan logout dan harus login kembali untuk mengubah password.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
