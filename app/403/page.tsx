"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoBack = () => {
    // Redirect to the user's own dashboard based on their role
    const roles: string[] = user?.roles || [];
    if (roles.includes("super-admin")) router.replace("/superadmin");
    else if (roles.includes("admin")) router.replace("/admin");
    else if (roles.includes("instructor")) router.replace("/instructor");
    else router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldExclamationIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          403
        </h1>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Akses Ditolak
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
          <br />
          Silakan kembali ke halaman sesuai role Anda.
        </p>

        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
