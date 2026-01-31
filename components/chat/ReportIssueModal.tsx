"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: number;
  className?: string;
}

const categories = [
  { value: "technical", label: "Masalah Teknis", desc: "Login, akses, error sistem" },
  { value: "learning", label: "Masalah Pembelajaran", desc: "Materi, tugas, quiz" },
  { value: "certificate", label: "Masalah Sertifikat", desc: "Penerbitan, kesalahan data" },
  { value: "payment", label: "Masalah Pembayaran", desc: "Invoice, refund" },
  { value: "other", label: "Lainnya", desc: "Masalah lainnya" },
];

const priorities = [
  { value: "low", label: "Rendah", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "medium", label: "Sedang", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "high", label: "Tinggi", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700 border-red-200" },
];

export default function ReportIssueModal({
  isOpen,
  onClose,
  classId,
  className,
}: ReportIssueModalProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset and close after showing success
    setTimeout(() => {
      setSubject("");
      setDescription("");
      setCategory("other");
      setPriority("medium");
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {isSuccess ? (
          // Success State
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4"
            >
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Laporan Terkirim!
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Tim admin akan segera meninjau laporan Anda.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-red-500 to-orange-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Laporkan Kendala</h3>
                  <p className="text-sm text-white/70">Kirim ke Admin</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Kategori
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        category === cat.value
                          ? "border-pln-primary bg-pln-primary/5"
                          : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className={`block text-sm font-medium ${
                        category === cat.value ? "text-pln-primary" : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {cat.label}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {cat.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Prioritas
                </label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        priority === p.value
                          ? p.color + " border-current"
                          : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Judul Masalah
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Tidak bisa mengakses materi modul 3"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Deskripsi Lengkap
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan masalah yang Anda alami secara detail..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20"
                  required
                />
              </div>

              {/* Class info if provided */}
              {classId && className && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Terkait Kelas:
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {className}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!subject.trim() || !description.trim() || isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    Kirim Laporan
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
