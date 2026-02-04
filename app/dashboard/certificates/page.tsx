"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { certificateApi, type Certificate } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateApi.getMyCertificates();
      setCertificates(data);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert: Certificate) => {
    try {
      const blob = await certificateApi.download(cert.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.certificate_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download certificate:", error);
    }
  };

  const getGradeBadge = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-emerald-100 text-emerald-700",
      B: "bg-blue-100 text-blue-700",
      C: "bg-amber-100 text-amber-700",
      D: "bg-orange-100 text-orange-700",
      E: "bg-red-100 text-red-700",
    };
    return colors[grade] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Sertifikat
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sertifikat pelatihan yang telah Anda selesaikan
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DocumentTextIcon className="h-8 w-8 mx-auto text-pln-primary mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {certificates.length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Sertifikat
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircleIcon className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {certificates.filter((c) => c.is_valid).length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Valid
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AcademicCapIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {certificates.filter((c) => c.grade === "A").length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grade A
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CalendarIcon className="h-8 w-8 mx-auto text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {new Date().getFullYear()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tahun Ini
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Memuat sertifikat...</p>
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DocumentTextIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">Belum ada sertifikat</p>
              <p className="text-sm text-slate-400">
                Selesaikan kelas untuk mendapatkan sertifikat
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {cert.course_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {cert.certificate_number}
                      </p>
                    </div>
                    {cert.is_valid ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Nilai:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {cert.final_score.toFixed(2)}%
                        </span>
                        <Badge
                          className={`${getGradeBadge(cert.grade)} hover:${getGradeBadge(cert.grade)}`}
                        >
                          {cert.grade}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Total Jam:
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {cert.total_hours} jam
                      </span>
                    </div>

                    {cert.instructor_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Instruktur:
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {cert.instructor_name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Tanggal Terbit:
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(cert.issue_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Verification Code */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <ShieldCheckIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {cert.verification_code}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleDownload(cert)}
                    className="w-full bg-pln-primary hover:bg-pln-primary/90"
                    disabled={!cert.is_valid}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download Sertifikat
                  </Button>

                  {!cert.is_valid && cert.notes && (
                    <p className="text-xs text-red-600 mt-2 text-center">
                      {cert.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
