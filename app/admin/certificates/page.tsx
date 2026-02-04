"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShieldCheckIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  certificateApi,
  type Certificate,
  type CertificateStats,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterValid, setFilterValid] = useState<string>("all");
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [revokeNotes, setRevokeNotes] = useState("");

  useEffect(() => {
    fetchCertificates();
    fetchStats();
  }, [filterValid, search]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterValid !== "all") {
        params.is_valid = filterValid === "valid";
      }
      if (search) {
        params.search = search;
      }
      const data = await certificateApi.getAll(params);
      setCertificates(data.data);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await certificateApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleRevoke = async () => {
    if (!selectedCert) return;

    try {
      await certificateApi.revoke(selectedCert.id, revokeNotes);
      setShowRevokeDialog(false);
      setSelectedCert(null);
      setRevokeNotes("");
      fetchCertificates();
      fetchStats();
    } catch (error) {
      console.error("Failed to revoke certificate:", error);
      alert("Gagal mencabut sertifikat");
    }
  };

  const handleRestore = async (cert: Certificate) => {
    if (!confirm("Yakin ingin mengaktifkan kembali sertifikat ini?")) return;

    try {
      await certificateApi.restore(cert.id);
      fetchCertificates();
      fetchStats();
    } catch (error) {
      console.error("Failed to restore certificate:", error);
      alert("Gagal mengaktifkan sertifikat");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Kelola Sertifikat
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor dan kelola sertifikat pelatihan
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DocumentChartBarIcon className="h-8 w-8 mx-auto text-pln-primary mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
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
                <ShieldCheckIcon className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.valid}
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
                <XCircleIcon className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.revoked}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dicabut
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DocumentChartBarIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.this_month}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bulan Ini
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Cari nomor sertifikat, nama user, atau kelas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterValid} onValueChange={setFilterValid}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="revoked">Dicabut</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Memuat sertifikat...</p>
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <DocumentChartBarIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">Tidak ada sertifikat</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Nomor Sertifikat
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Peserta
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Kelas
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Nilai
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tanggal Terbit
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  {certificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="p-4">
                        <p className="font-mono text-sm text-slate-900 dark:text-white">
                          {cert.certificate_number}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {cert.student_name}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {cert.course_name}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {cert.final_score.toFixed(1)}%
                          </span>
                          <Badge variant="outline">{cert.grade}</Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(cert.issue_date).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </td>
                      <td className="p-4">
                        {cert.is_valid ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            Valid
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            Dicabut
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {cert.is_valid ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCert(cert);
                              setShowRevokeDialog(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Cabut
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(cert)}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Aktifkan
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revoke Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cabut Sertifikat</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Anda akan mencabut sertifikat:
            </p>
            {selectedCert && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="font-mono text-sm text-slate-900 dark:text-white">
                  {selectedCert.certificate_number}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedCert.student_name} - {selectedCert.course_name}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Alasan Pencabutan (opsional)
              </label>
              <Textarea
                value={revokeNotes}
                onChange={(e) => setRevokeNotes(e.target.value)}
                placeholder="Masukkan alasan pencabutan sertifikat..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRevokeDialog(false);
                setSelectedCert(null);
                setRevokeNotes("");
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cabut Sertifikat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
