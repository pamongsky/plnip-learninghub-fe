"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MegaphoneIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  ChevronDownIcon,
  TrashIcon,
  PencilIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@heroicons/react/24/solid";

// Priority configuration dengan 4 level
const priorityConfig = {
  info: {
    label: "Informasi",
    description: "Pengumuman bersifat informatif",
    color: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: InformationCircleIcon,
  },
  normal: {
    label: "Umum",
    description: "Pengumuman bersifat umum",
    color:
      "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400",
    iconBg: "bg-slate-50 dark:bg-slate-500/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    icon: CheckCircleIcon,
  },
  important: {
    label: "Penting",
    description: "Pengumuman penting perlu diperhatikan",
    color:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: ExclamationTriangleIcon,
  },
  urgent: {
    label: "Urgent",
    description: "Pengumuman sangat penting & mendesak",
    color: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
    iconBg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    icon: BellAlertIcon,
  },
};

type PriorityType = keyof typeof priorityConfig;

// Mock pengumuman umum (dari semua - admin, superadmin, instructor lain)
const allAnnouncements = [
  {
    id: "a1",
    title: "Pembaruan Sistem Penilaian Otomatis",
    content:
      "Dengan hormat, kami informasikan bahwa mulai 1 Februari 2026, sistem penilaian akan diperbarui dengan fitur grading otomatis untuk quiz. Bapak/Ibu Instruktur tetap dapat melakukan penyesuaian nilai secara manual jika diperlukan. Mohon untuk mempelajari panduan yang telah kami lampirkan.",
    date: "22 Jan 2026",
    author: "Divisi IT",
    authorRole: "admin",
    priority: "important" as PriorityType,
  },
  {
    id: "a2",
    title: "Jadwal Libur Nasional Februari 2026",
    content:
      "Kepada Yth. Bapak/Ibu Instruktur, berikut jadwal libur nasional bulan Februari 2026:\n• 10 Feb - Tahun Baru Imlek\n• 27 Feb - Isra Mi'raj\n\nKelas yang jatuh pada tanggal tersebut akan dijadwalkan ulang oleh bagian administrasi. Terima kasih atas perhatiannya.",
    date: "20 Jan 2026",
    author: "Bagian SDM",
    authorRole: "admin",
    priority: "info" as PriorityType,
  },
  {
    id: "a3",
    title: "Maintenance Server LMS",
    content:
      "Pemberitahuan penting: Server LMS akan menjalani pemeliharaan rutin pada tanggal 25 Januari 2026 pukul 22:00-02:00 WIB. Selama periode tersebut, akses ke platform akan terbatas. Mohon untuk menyelesaikan kegiatan pembelajaran sebelum waktu tersebut.",
    date: "18 Jan 2026",
    author: "Tim Infrastruktur",
    authorRole: "admin",
    priority: "urgent" as PriorityType,
  },
  {
    id: "a4",
    title: "Pedoman Penulisan Materi Pembelajaran",
    content:
      "Sebagai panduan, kami sampaikan standar penulisan materi pembelajaran yang baru. Dokumen lengkap dapat diunduh melalui menu Resources. Penerapan standar ini bertujuan untuk meningkatkan kualitas dan konsistensi materi di seluruh program pelatihan.",
    date: "15 Jan 2026",
    author: "Bagian Kurikulum",
    authorRole: "admin",
    priority: "normal" as PriorityType,
  },
];

// Mock pengumuman yang dibuat instructor ini
const myAnnouncements = [
  {
    id: "m1",
    title: "Perpanjangan Batas Waktu Pengumpulan Tugas Modul 3",
    content:
      "Kepada peserta pelatihan Dasar-Dasar Pembangkit Listrik,\n\nDengan ini kami informasikan bahwa batas waktu pengumpulan tugas Modul 3 diperpanjang hingga tanggal 28 Januari 2026 pukul 23:59 WIB.\n\nMohon untuk memanfaatkan waktu tambahan ini dengan sebaik-baiknya. Pertanyaan dapat disampaikan melalui forum diskusi.\n\nTerima kasih.",
    date: "21 Jan 2026",
    targetClass: "Dasar-Dasar Pembangkit Listrik",
    targetClassId: "1",
    targetCount: 32,
    priority: "important" as PriorityType,
  },
  {
    id: "m2",
    title: "Perubahan Jadwal Sesi Kelas",
    content:
      "Kepada peserta pelatihan K3,\n\nDengan hormat kami sampaikan bahwa sesi kelas yang semula dijadwalkan pada:\n• Rabu, 22 Januari 2026 pukul 09:00 WIB\n\nDipindahkan menjadi:\n• Kamis, 23 Januari 2026 pukul 10:00 WIB\n\nPerubahan ini disebabkan adanya rapat koordinasi yang tidak dapat ditunda. Kami mohon maaf atas ketidaknyamanan ini.\n\nTerima kasih atas pengertiannya.",
    date: "20 Jan 2026",
    targetClass: "Keselamatan Kerja (K3)",
    targetClassId: "2",
    targetCount: 28,
    priority: "urgent" as PriorityType,
  },
  {
    id: "m3",
    title: "Sumber Belajar Tambahan Tersedia",
    content:
      "Kepada seluruh peserta pelatihan,\n\nKami telah mengunggah materi pembelajaran tambahan berupa e-book dan video tutorial di menu Resources. Materi ini dapat digunakan sebagai referensi pendukung untuk memperdalam pemahaman.\n\nSelamat belajar!",
    date: "18 Jan 2026",
    targetClass: "Semua Kelas",
    targetClassId: "all",
    targetCount: 84,
    priority: "info" as PriorityType,
  },
];

export default function InstructorAnnouncementsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Real classes from API
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Edit & Delete states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetClass: "",
    priority: "normal" as PriorityType,
  });
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);

  // Simple markdown-like formatter for preview
  const formatContent = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        // Heading
        if (line.startsWith("### ")) {
          return `<h3 class="text-base font-bold mt-3 mb-2 text-slate-800 dark:text-white">${line.substring(4)}</h3>`;
        }
        // Bullet list
        if (line.trim().startsWith("• ")) {
          return `<li class="ml-4">${line.trim().substring(2)}</li>`;
        }
        // Numbered list
        if (/^\d+\.\s/.test(line.trim())) {
          return `<li class="ml-4">${line.trim().replace(/^\d+\.\s/, "")}</li>`;
        }
        // Bold and italic
        let formatted = line
          .replace(
            /\*\*(.*?)\*\*/g,
            '<strong class="font-semibold">$1</strong>',
          )
          .replace(/_(.*?)_/g, '<em class="italic">$1</em>');

        return formatted ? `<p class="mb-2">${formatted}</p>` : "<br/>";
      })
      .join("");
  };

  // Text formatting functions
  const insertFormatting = (before: string, after: string = "") => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = newAnnouncement.content.substring(start, end);
    const beforeText = newAnnouncement.content.substring(0, start);
    const afterText = newAnnouncement.content.substring(end);

    const newContent = beforeText + before + selectedText + after + afterText;
    setNewAnnouncement({ ...newAnnouncement, content: newContent });

    // Set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef) {
        const newPos =
          start + before.length + selectedText.length + after.length;
        textareaRef.focus();
        textareaRef.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const insertBulletList = () => {
    if (!textareaRef) return;
    const start = textareaRef.selectionStart;
    const beforeText = newAnnouncement.content.substring(0, start);
    const afterText = newAnnouncement.content.substring(start);

    const newLine = beforeText.endsWith("\n") || beforeText === "" ? "" : "\n";
    const bulletText = `${newLine}• `;

    setNewAnnouncement({
      ...newAnnouncement,
      content: beforeText + bulletText + afterText,
    });

    setTimeout(() => {
      if (textareaRef) {
        const newPos = start + bulletText.length;
        textareaRef.focus();
        textareaRef.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const insertNumberedList = () => {
    if (!textareaRef) return;
    const start = textareaRef.selectionStart;
    const beforeText = newAnnouncement.content.substring(0, start);
    const afterText = newAnnouncement.content.substring(start);

    const newLine = beforeText.endsWith("\n") || beforeText === "" ? "" : "\n";
    const numberedText = `${newLine}1. `;

    setNewAnnouncement({
      ...newAnnouncement,
      content: beforeText + numberedText + afterText,
    });

    setTimeout(() => {
      if (textareaRef) {
        const newPos = start + numberedText.length;
        textareaRef.focus();
        textareaRef.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Fetch real classes from instructor dashboard
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await api.get("/dashboard/instructor");
        const classes = res.data.data.classes || [];
        setMyClasses(classes);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        setMyClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Filter announcements
  const filteredAllAnnouncements = allAnnouncements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredMyAnnouncements = myAnnouncements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateAnnouncement = () => {
    if (editingId) {
      // Update existing announcement
      console.log("Updating announcement:", editingId, newAnnouncement);
      // Would call API: await api.put(`/announcements/${editingId}`, newAnnouncement);
      setEditingId(null);
    } else {
      // Create new announcement
      console.log("Creating announcement:", newAnnouncement);
      // Would call API: await api.post("/announcements", newAnnouncement);
    }
    setShowCreateModal(false);
    setNewAnnouncement({
      title: "",
      content: "",
      targetClass: "",
      priority: "normal",
    });
    setShowPreview(false);
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingId(announcement.id);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      targetClass: announcement.targetClassId || "",
      priority: announcement.priority,
    });
    setShowCreateModal(true);
    setExpandedId(null);
  };

  const handleDeleteAnnouncement = (id: string) => {
    // Would call API: await api.delete(`/announcements/${id}`);
    console.log("Deleting announcement:", id);
    setShowDeleteConfirm(null);
    setExpandedId(null);
  };

  const handleCancelEdit = () => {
    setShowCreateModal(false);
    setEditingId(null);
    setNewAnnouncement({
      title: "",
      content: "",
      targetClass: "",
      priority: "normal",
    });
    setShowPreview(false);
  };

  const getPriorityConfig = (priority: PriorityType) => {
    return priorityConfig[priority] || priorityConfig.normal;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Pengumuman
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola dan publikasikan informasi untuk peserta pelatihan Anda
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pln-primary to-pln-light text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pln-primary/25 transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Buat Pengumuman
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit"
      >
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "all"
              ? "bg-white dark:bg-slate-700 text-pln-primary shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Pengumuman
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-600">
            {allAnnouncements.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("mine")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === "mine"
              ? "bg-white dark:bg-slate-700 text-pln-primary shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Pengumuman Saya
          <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-600">
            {myAnnouncements.length}
          </span>
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari pengumuman..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
        />
      </motion.div>

      {/* Announcements List - All */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {filteredAllAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada pengumuman
              </p>
            </div>
          ) : (
            filteredAllAnnouncements.map((announcement, index) => {
              const config = getPriorityConfig(announcement.priority);
              const PriorityIcon = config.icon;

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedId(
                        expandedId === announcement.id ? null : announcement.id,
                      )
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}
                      >
                        <PriorityIcon
                          className={`w-6 h-6 ${config.iconColor}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {announcement.date}
                          </span>
                          <span>•</span>
                          <span>{announcement.author}</span>
                        </div>
                        <AnimatePresence>
                          {expandedId === announcement.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {announcement.content}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronDownIcon
                        className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                          expandedId === announcement.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Announcements List - My Announcements */}
      {activeTab === "mine" && (
        <div className="space-y-4">
          {filteredMyAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Belum ada pengumuman yang Anda publikasikan
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm text-pln-primary hover:bg-pln-primary/5 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Buat Pengumuman Pertama
              </button>
            </div>
          ) : (
            filteredMyAnnouncements.map((announcement, index) => {
              const config = getPriorityConfig(announcement.priority);
              const PriorityIcon = config.icon;

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedId(
                        expandedId === announcement.id ? null : announcement.id,
                      )
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}
                      >
                        <PriorityIcon
                          className={`w-6 h-6 ${config.iconColor}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${config.color}`}
                          >
                            {config.label}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-pln-primary/10 dark:bg-pln-primary/20 text-pln-primary">
                            <UserGroupIcon className="w-3 h-3" />
                            {announcement.targetClass}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({announcement.targetCount} peserta)
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {announcement.date}
                          </span>
                        </div>
                        <AnimatePresence>
                          {expandedId === announcement.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {announcement.content}
                              </p>
                              <div className="mt-4 flex gap-2">
                                <button
                                  onClick={() =>
                                    handleEditAnnouncement(announcement)
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                  <PencilIcon className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    setShowDeleteConfirm(announcement.id)
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <TrashIcon className="w-3 h-3" />
                                  Hapus
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <ChevronDownIcon
                        className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                          expandedId === announcement.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Create Announcement Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {editingId ? "Edit Pengumuman" : "Buat Pengumuman"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingId
                      ? "Perbarui informasi pengumuman"
                      : "Publikasikan informasi untuk peserta pelatihan"}
                  </p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Target Class */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Kelas Tujuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newAnnouncement.targetClass}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        targetClass: e.target.value,
                      })
                    }
                    disabled={loadingClasses}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingClasses
                        ? "Memuat kelas..."
                        : "Pilih kelas tujuan..."}
                    </option>
                    <option value="all">
                      📢 Semua Kelas Saya (
                      {myClasses.reduce(
                        (acc, c) => acc + (c.participants || 0),
                        0,
                      )}{" "}
                      peserta)
                    </option>
                    {myClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.title} ({cls.participants || 0} peserta)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    {newAnnouncement.targetClass === "all"
                      ? "Pengumuman akan dikirim ke semua peserta di seluruh kelas Anda"
                      : "Pilih kelas spesifik atau semua kelas"}
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Perubahan Jadwal Sesi Kelas"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Isi Pengumuman <span className="text-red-500">*</span>
                  </label>

                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-t-xl border-b-0">
                    <button
                      type="button"
                      onClick={() => insertFormatting("**", "**")}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
                      title="Bold (tebal)"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 4v12h4.5c2.5 0 4.5-1.5 4.5-4 0-1.5-.8-2.8-2-3.5.7-.7 1-1.6 1-2.5 0-2-1.5-3-4-3H6zm2.5 2h2c1 0 1.5.5 1.5 1.5s-.5 1.5-1.5 1.5h-2V6zm0 5h2.5c1.2 0 2 .8 2 2s-.8 2-2 2H8.5v-4z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("_", "_")}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
                      title="Italic (miring)"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 4h4v2h-1.5l-2 8H12v2H8v-2h1.5l2-8H10V4z" />
                      </svg>
                    </button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                    <button
                      type="button"
                      onClick={insertBulletList}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
                      title="Bullet list"
                    >
                      <ListBulletIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={insertNumberedList}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
                      title="Numbered list"
                    >
                      <Bars3BottomLeftIcon className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => insertFormatting("\n### ", "")}
                      className="px-2 py-1 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
                      title="Heading"
                    >
                      H
                    </button>
                    <div className="flex-1"></div>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        showPreview
                          ? "bg-pln-primary text-white"
                          : "hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300"
                      }`}
                      title="Toggle preview"
                    >
                      {showPreview ? "📝 Edit" : "👁️ Preview"}
                    </button>
                    <span className="text-xs text-slate-400">
                      {newAnnouncement.content.length} karakter
                    </span>
                  </div>

                  {showPreview ? (
                    <div
                      className="w-full min-h-[200px] px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-b-xl text-sm dark:text-white"
                      dangerouslySetInnerHTML={{
                        __html:
                          formatContent(newAnnouncement.content) ||
                          '<p class="text-slate-400 italic">Preview akan muncul di sini...</p>',
                      }}
                    />
                  ) : (
                    <textarea
                      ref={(el) => setTextareaRef(el)}
                      placeholder="Tulis isi pengumuman dengan jelas dan lengkap...&#10;&#10;Gunakan toolbar untuk:&#10;• Membuat teks tebal&#10;• Membuat bullet list&#10;• Menambahkan heading"
                      value={newAnnouncement.content}
                      onChange={(e) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          content: e.target.value,
                        })
                      }
                      rows={8}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-b-xl rounded-t-none text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white resize-none font-mono"
                    />
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    💡 Tips: Gunakan **teks** untuk tebal, _teks_ untuk miring,
                    • untuk bullet
                  </p>
                </div>

                {/* Priority - 4 Options */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tingkat Prioritas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(priorityConfig) as PriorityType[]).map(
                      (key) => {
                        const config = priorityConfig[key];
                        const PriorityIcon = config.icon;
                        const isSelected = newAnnouncement.priority === key;

                        return (
                          <label
                            key={key}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-pln-primary bg-pln-primary/5 dark:bg-pln-primary/10"
                                : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                            }`}
                          >
                            <input
                              type="radio"
                              name="priority"
                              value={key}
                              checked={isSelected}
                              onChange={(e) =>
                                setNewAnnouncement({
                                  ...newAnnouncement,
                                  priority: e.target.value as PriorityType,
                                })
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.iconBg}`}
                            >
                              <PriorityIcon
                                className={`w-4 h-4 ${config.iconColor}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-sm font-medium ${isSelected ? "text-pln-primary" : "text-slate-700 dark:text-slate-200"}`}
                              >
                                {config.label}
                              </span>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                                {config.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircleIcon className="w-5 h-5 text-pln-primary flex-shrink-0" />
                            )}
                          </label>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0 z-10">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={
                    !newAnnouncement.title ||
                    !newAnnouncement.content ||
                    !newAnnouncement.targetClass
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pln-primary to-pln-light text-white text-sm font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {editingId ? "Perbarui" : "Publikasikan"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white text-center mb-2">
                  Hapus Pengumuman?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                  Pengumuman yang dihapus tidak dapat dikembalikan. Peserta
                  tidak akan bisa melihat pengumuman ini lagi.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(showDeleteConfirm)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
