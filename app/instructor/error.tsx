"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ExclamationTriangleIcon, HomeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function InstructorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // error handled silently
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Instructor Panel Mengalami Masalah
        </h2>

        <p className="text-gray-600 mb-6">
          Terjadi kesalahan saat memuat halaman instructor. Silakan coba lagi.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-left">
            <p className="text-xs font-mono text-red-700">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Coba Lagi
          </button>
          <Link
            href="/instructor"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            <HomeIcon className="h-4 w-4" />
            Instructor Home
          </Link>
        </div>
      </div>
    </div>
  );
}
