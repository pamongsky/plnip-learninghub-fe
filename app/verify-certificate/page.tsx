"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { certificateApi, type Certificate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function VerifyCertificatePage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
    certificate?: Certificate;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      return;
    }

    try {
      setLoading(true);
      const data = await certificateApi.verify(verificationCode.trim());
      setResult(data);
    } catch (error) {
      setResult({
        valid: false,
        message: "Kode verifikasi tidak valid atau terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVerificationCode("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pln-primary/10 rounded-full mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-pln-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Verifikasi Sertifikat
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Periksa keaslian sertifikat pelatihan PLN IP
          </p>
        </motion.div>

        {/* Verification Form */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Kode Verifikasi
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(e.target.value.toUpperCase())
                        }
                        placeholder="Masukkan 16 digit kode verifikasi"
                        className="font-mono text-center text-lg tracking-wider"
                        maxLength={16}
                        required
                      />
                      <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Kode verifikasi terdapat di bagian bawah sertifikat
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-pln-primary hover:bg-pln-primary/90"
                    disabled={loading || verificationCode.length !== 16}
                  >
                    {loading ? "Memverifikasi..." : "Verifikasi Sertifikat"}
                  </Button>
                </form>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Catatan:</strong> Kode verifikasi adalah kombinasi
                    16 karakter alfanumerik yang unik untuk setiap sertifikat.
                    Pastikan Anda memasukkan kode dengan benar.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Verification Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card
              className={`border-2 ${
                result.valid
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                  : "border-red-500 bg-red-50/50 dark:bg-red-900/10"
              }`}
            >
              <CardContent className="pt-6">
                {/* Status Icon */}
                <div className="text-center mb-6">
                  {result.valid ? (
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-4">
                      <CheckCircleIcon className="h-12 w-12 text-white" />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4">
                      <XCircleIcon className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      result.valid
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {result.valid
                      ? "Sertifikat Valid"
                      : "Sertifikat Tidak Valid"}
                  </h2>
                  <p
                    className={`${
                      result.valid
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-red-600 dark:text-red-300"
                    }`}
                  >
                    {result.message}
                  </p>
                </div>

                {/* Certificate Details (if valid) */}
                {result.valid && result.certificate && (
                  <div className="space-y-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5" />
                      Detail Sertifikat
                    </h3>

                    <div className="grid gap-4">
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Nomor Sertifikat:
                        </span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {result.certificate.certificate_number}
                        </span>
                      </div>

                      <div className="flex items-start justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Penerima:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {result.certificate.student_name}
                        </span>
                      </div>

                      <div className="flex items-start justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <AcademicCapIcon className="h-4 w-4" />
                          Kelas:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white text-right">
                          {result.certificate.course_name}
                        </span>
                      </div>

                      <div className="flex items-start justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Nilai:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {result.certificate.final_score.toFixed(2)}%
                          </span>
                          <Badge>{result.certificate.grade}</Badge>
                        </div>
                      </div>

                      <div className="flex items-start justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Total Jam:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {result.certificate.total_hours} jam
                        </span>
                      </div>

                      {result.certificate.instructor_name && (
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Instruktur:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {result.certificate.instructor_name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Tanggal Selesai:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {new Date(
                            result.certificate.completion_date,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-start justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Tanggal Terbit:
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {new Date(
                            result.certificate.issue_date,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Verification Badge */}
                    <div className="mt-6 p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <ShieldCheckIcon className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                            Sertifikat Terverifikasi
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                            Sertifikat ini diterbitkan secara resmi oleh PLN IP
                            dan telah diverifikasi pada{" "}
                            {new Date().toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Try Another Button */}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-6"
                >
                  Verifikasi Sertifikat Lain
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
