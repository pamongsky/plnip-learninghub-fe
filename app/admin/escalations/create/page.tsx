"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { escalationApi } from "@/lib/api/escalation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const categories = [
  {
    value: "technical",
    label: "Masalah Teknis",
    icon: "🔧",
    description: "Kendala login, error sistem, bug, atau akses platform",
  },
  {
    value: "learning",
    label: "Masalah Pembelajaran",
    icon: "📚",
    description: "Masalah konten, video, kuis, atau materi kelas",
  },
  {
    value: "certificate",
    label: "Masalah Sertifikat",
    icon: "🎓",
    description: "Sertifikat belum muncul, salah nama, atau gagal download",
  },
  {
    value: "other",
    label: "Lainnya",
    icon: "📋",
    description: "Pertanyaan umum atau kendala di luar kategori di atas",
  },
];

const priorities = [
  {
    value: "low",
    label: "Rendah",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    value: "medium",
    label: "Sedang",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "high",
    label: "Tinggi",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    value: "urgent",
    label: "Urgent",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

export default function CreateEscalationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "technical",
    priority: "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await escalationApi.createTicket(formData);
      router.push("/admin/escalations");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal membuat tiket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Kembali
          </button>
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Buat Tiket ke Super Admin
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Laporkan kendala atau buat permintaan ke Super Admin
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800"
          >
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Category Selection */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Kategori Masalah
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, category: cat.value })
                    }
                    className={`rounded-xl border-2 p-4 text-center transition-all ${
                      formData.category === cat.value
                        ? "border-pln-primary bg-pln-50 dark:bg-pln-900/20"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      {cat.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Selection */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Prioritas
              </label>
              <div className="flex flex-wrap gap-3">
                {priorities.map((prio) => (
                  <button
                    key={prio.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, priority: prio.value })
                    }
                    className={`rounded-full px-4 py-2 text-sm font-medium border-2 transition-all ${
                      formData.priority === prio.value
                        ? `${prio.color} border-current ring-2 ring-offset-2 ring-current`
                        : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {prio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Judul Tiket <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Contoh: Error saat sync data Moodle"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Deskripsi Detail <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Jelaskan masalah atau permintaan Anda secara detail..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
              />
              <p className="mt-2 text-xs text-slate-400">
                Sertakan informasi yang relevan seperti langkah-langkah yang
                sudah dilakukan, screenshot, atau error message.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.subject || !formData.description}
                className="bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary gap-2"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    Kirim Tiket
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
