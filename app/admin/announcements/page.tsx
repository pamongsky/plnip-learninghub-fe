"use client";

import { useState, useEffect } from "react";
// import { useAuth } from "@/contexts/AuthContext"; // Commented out for Admin context
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
} from "@heroicons/react/24/outline";

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

// Mock pengumuman umum (Masuk ke Admin dari System/SuperAdmin)
const allAnnouncements = [
  {
    id: "a1",
    title: "Pembaruan Sistem Penilaian Otomatis",
    content:
      "Dengan hormat, kami informasikan bahwa mulai 1 Februari 2026, sistem penilaian akan diperbarui dengan fitur grading otomatis untuk quiz.",
    date: "22 Jan 2026",
    author: "Super Admin",
    authorRole: "superadmin",
    priority: "important" as PriorityType,
  },
  {
    id: "a2",
    title: "Jadwal Audit ISO 2026",
    content:
      "Kepada seluruh Unit, Audit ISO akan dilaksanakan pada tanggal 15-20 Februari 2026. Mohon persiapkan dokumen terkait.",
    date: "20 Jan 2026",
    author: "Tim Audit Pusat",
    authorRole: "superadmin",
    priority: "urgent" as PriorityType,
  },
];

// Mock pengumuman yang dibuat Admin ini (Sent Items)
const myAnnouncements = [
  {
    id: "m1",
    title: "Pemeliharaan Lokal Server Unit",
    content:
      "Server lokal unit akan direstart pada hari Sabtu pukul 23:00 WIB.",
    date: "24 Jan 2026",
    targetClass: "Semua User Unit",
    targetClassId: "all",
    targetCount: 150,
    priority: "info" as PriorityType,
  },
  {
    id: "m2",
    title: "Briefing Instruktur Baru",
    content:
      "Mohon kehadiran seluruh instruktur baru di Ruang Rapat Lt. 2 pada Senin, 27 Jan 2026.",
    date: "21 Jan 2026",
    targetClass: "Instruktur",
    targetClassId: "instructors",
    targetCount: 12,
    priority: "important" as PriorityType,
  },
];

// Mock classes for target selection (Admin sees all courses)
const adminClasses = [
  { id: "all", name: "Semua User Unit", participants: 150 },
  { id: "instructors", name: "Semua Instruktur", participants: 12 },
  { id: "1", name: "Maintenance Turbin Gas", participants: 32 },
  { id: "2", name: "Safety Induction", participants: 45 },
];

export default function AdminAnnouncementsPage() {
  // const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetClass: "",
    priority: "normal" as PriorityType,
  });

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
    // Would send to API
    console.log("Creating announcement:", newAnnouncement);
    setShowCreateModal(false);
    setNewAnnouncement({
      title: "",
      content: "",
      targetClass: "",
      priority: "normal",
    });
  };

  const getPriorityConfig = (priority: PriorityType) => {
    return priorityConfig[priority] || priorityConfig.normal;
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Kelola Pengumuman
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Buat dan kelola pengumuman (Tampilan User/Instructor)
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
          Masuk (Inbox)
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
          Dibuat Saya (Sent)
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

      {/* Announcements List - All (Inbox) */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {filteredAllAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada pengumuman masuk
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

      {/* Announcements List - My Announcements (Sent) */}
      {activeTab === "mine" && (
        <div className="space-y-4">
          {filteredMyAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Belum ada pengumuman yang Anda buat
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
                            ({announcement.targetCount} penerima)
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
                                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                  <PencilIcon className="w-3 h-3" />
                                  Edit
                                </button>
                                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
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
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Buat Pengumuman Baru
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Publikasikan informasi untuk pengguna atau instruktur
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
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
                    Target Penerima <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newAnnouncement.targetClass}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        targetClass: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                  >
                    <option value="">Pilih target penerima...</option>
                    {adminClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.participants} orang)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pemeliharaan Server"
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
                  <textarea
                    placeholder="Tulis isi pengumuman..."
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    rows={5}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white resize-none"
                  />
                </div>

                {/* Priority */}
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
              <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
                <button
                  onClick={() => setShowCreateModal(false)}
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
                  Publikasikan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
