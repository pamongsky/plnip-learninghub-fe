"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // error handled silently
    // TODO: Send to error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Oops! Terjadi Kesalahan
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  Sepertinya ada yang tidak beres
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <p className="text-gray-600 mb-6">
              Aplikasi mengalami masalah yang tidak terduga. Silakan coba lagi atau kembali ke beranda.
            </p>

            {/* Dev Mode Error Details */}
            {process.env.NODE_ENV === "development" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-xs font-semibold text-red-800 mb-2">
                  Error Details (Development Only):
                </p>
                <p className="text-sm font-mono text-red-700 break-words mb-2">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600">
                    Digest: {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="mt-3">
                    <summary className="text-xs text-red-700 cursor-pointer hover:text-red-800">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-red-600 mt-2 overflow-x-auto whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => reset()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-medium shadow-lg hover:shadow-xl"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Coba Lagi
              </button>
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
              >
                <HomeIcon className="h-5 w-5" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Jika masalah terus berlanjut, silakan hubungi tim support kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
