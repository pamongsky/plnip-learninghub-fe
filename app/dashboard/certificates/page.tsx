"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import certificateApi, { type Certificate } from "@/lib/api/certificates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

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
      a.download = cert.original_filename || `${cert.certificate_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Gagal download sertifikat");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Sertifikat</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sertifikat pelatihan yang telah Anda selesaikan
        </p>
      </motion.div>

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
                Sertifikat akan tersedia setelah admin mengupload
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {cert.course?.title || "—"}
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

                  <div className="flex items-center gap-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {new Date(cert.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleDownload(cert)}
                    className="w-full bg-pln-primary hover:bg-pln-primary/90"
                    disabled={!cert.is_valid}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download Sertifikat
                  </Button>

                  {!cert.is_valid && cert.notes && (
                    <p className="text-xs text-red-600 mt-2 text-center">{cert.notes}</p>
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
