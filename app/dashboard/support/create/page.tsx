"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  InformationCircleIcon,
  CheckIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { supportApi } from "@/lib/api";

interface Category {
  value: string;
  label: string;
  description: string;
  icon: string;
}

const categories: Category[] = [
  {
    value: "access",
    label: "Akses Kelas",
    description: "Tidak bisa masuk kelas, error akses, enrollment",
    icon: "🔐",
  },
  {
    value: "material",
    label: "Materi Pembelajaran",
    description: "Video tidak jalan, dokumen corrupt, konten error",
    icon: "📚",
  },
  {
    value: "certificate",
    label: "Sertifikat",
    description: "Sertifikat belum terbit, nama salah, download gagal",
    icon: "🏆",
  },
  {
    value: "account",
    label: "Akun & Login",
    description: "Lupa password, profil, masalah login",
    icon: "👤",
  },
  {
    value: "other",
    label: "Lainnya",
    description: "Pertanyaan umum atau kendala lain",
    icon: "💬",
  },
];

export default function CreateTicketPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCategory) {
      newErrors.category = "Pilih kategori kendala";
    }
    if (!subject.trim()) {
      newErrors.subject = "Subjek tidak boleh kosong";
    } else if (subject.trim().length < 10) {
      newErrors.subject = "Subjek minimal 10 karakter";
    }
    if (!description.trim()) {
      newErrors.description = "Deskripsi tidak boleh kosong";
    } else if (description.trim().length < 30) {
      newErrors.description = "Jelaskan kendala Anda minimal 30 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Map category values to backend enum
      const categoryMap: Record<string, string> = {
        access: "technical",
        material: "learning",
        certificate: "certificate",
        account: "technical",
        other: "other",
      };

      await supportApi.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        category: categoryMap[selectedCategory] || "other",
        priority: "medium", // Default for users
      });

      // Redirect to support list with success
      router.push("/dashboard/support?created=true");
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setErrors({
        submit: err.response?.data?.message || "Gagal membuat tiket. Silakan coba lagi.",
      });
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length + attachments.length > 5) {
      setErrors((prev) => ({ ...prev, attachments: "Maksimal 5 file gambar" }));
      return;
    }

    setAttachments([...attachments, ...imageFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, attachments: "" }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          href="/dashboard/support"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Buat Tiket Bantuan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Jelaskan kendala Anda, tim kami siap membantu
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Pilih Kategori Kendala
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pilih kategori yang paling sesuai dengan kendala Anda
            </p>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCategory === category.value
                      ? "border-pln-primary bg-pln-primary/5 dark:bg-pln-primary/10"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  {selectedCategory === category.value && (
                    <div className="absolute top-3 right-3">
                      <div className="h-5 w-5 rounded-full bg-pln-primary flex items-center justify-center">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className={`font-medium ${
                        selectedCategory === category.value
                          ? "text-pln-primary"
                          : "text-slate-900 dark:text-white"
                      }`}>
                        {category.label}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-sm text-red-500 mt-2">{errors.category}</p>
            )}
          </div>
        </motion.div>

        {/* Subject & Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Detail Kendala
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Subjek <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setErrors((prev) => ({ ...prev, subject: "" }));
                }}
                placeholder="Ringkasan singkat kendala Anda"
                className={`w-full rounded-xl border ${
                  errors.subject
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-slate-600 focus:border-pln-primary focus:ring-pln-primary/20"
                } bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2`}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Deskripsi Kendala <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: "" }));
                }}
                placeholder="Jelaskan kendala Anda secara detail:
- Apa yang terjadi?
- Kapan mulai terjadi?
- Langkah apa yang sudah dicoba?"
                rows={6}
                className={`w-full resize-none rounded-xl border ${
                  errors.description
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 dark:border-slate-600 focus:border-pln-primary focus:ring-pln-primary/20"
                } bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2`}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {description.length}/500 karakter
              </p>
            </div>
          </div>
        </motion.div>

        {/* Image Attachments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Lampiran Gambar (Opsional)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Unggah gambar/screenshot untuk membantu kami memahami kendala Anda
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Upload Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-pln-primary dark:hover:border-pln-light hover:bg-pln-primary/5 dark:hover:bg-pln-primary/10 transition-all flex flex-col items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-pln-primary dark:hover:text-pln-light"
              >
                <PhotoIcon className="w-8 h-8" />
                <span className="font-medium">Klik untuk upload atau drag & drop</span>
                <span className="text-xs">PNG, JPG, JPEG (Max 5 file)</span>
              </button>
              {errors.attachments && (
                <p className="text-sm text-red-500 mt-2">{errors.attachments}</p>
              )}
            </div>

            {/* Attached Files Preview */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {attachments.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="w-full aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4"
        >
          <div className="flex gap-3">
            <InformationCircleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm">
                Tips agar kendala cepat ditangani
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                <li>• Jelaskan langkah-langkah untuk mereproduksi masalah</li>
                <li>• Sebutkan browser dan device yang digunakan</li>
                <li>• Sertakan pesan error jika ada</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-end gap-4"
        >
          <Link
            href="/dashboard/support"
            className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Batal
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pln-primary text-white font-medium hover:bg-pln-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pln-primary/25"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Mengirim...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4" />
                Kirim Tiket
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
