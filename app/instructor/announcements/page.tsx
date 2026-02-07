"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
  ClockIcon,
} from "@heroicons/react/24/outline";

// Konfigurasi Prioritas - Skema Baru 4 Level + Fallback Legacy
const priorityConfig = {
  // Strict Mapping (Frontend & Backend Aligned)
  info: {
    label: "Informasi",
    color: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: InformationCircleIcon,
    weight: 1,
  },
  normal: {
    label: "Umum",
    color:
      "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400",
    iconBg: "bg-slate-50 dark:bg-slate-500/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    icon: CheckCircleIcon,
    weight: 2,
  },
  important: {
    label: "Penting",
    color:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: ExclamationTriangleIcon,
    weight: 3,
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400",
    iconBg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    icon: BellAlertIcon,
    weight: 4,
  },

  // Fallback for Legacy Backend Data
  low: {
    label: "Informasi",
    color: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: InformationCircleIcon,
    weight: 1,
  },
  medium: {
    // Legacy 'medium' becomes 'Normal' (Umum)
    label: "Umum",
    color:
      "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400",
    iconBg: "bg-slate-50 dark:bg-slate-500/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    icon: CheckCircleIcon,
    weight: 2,
  },
  high: {
    // Legacy 'high' becomes 'Penting' (Important)
    label: "Penting",
    color:
      "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: ExclamationTriangleIcon,
    weight: 3,
  },
};

type PriorityType = keyof typeof priorityConfig;

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: PriorityType;
  created_at: string;
  created_by: number;
  published_at?: string;
  date?: string; // Optional if used in UI
  target_classes: string[] | string; // API might return JSON string or array
  views_count: number;
  author_name?: string;
  creator_role?: string;
  creator?: {
    id: number;
    name: string;
    department?: string;
    position?: string;
  };
}

export default function InstructorAnnouncementsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "priority_high" | "priority_low"
  >("newest");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Data state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]); // all + mine
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit & Delete states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetClasses: [] as string[], // Changed to array for multi-select
    priority: "normal" as PriorityType,
    published_at: "", // Optional publish date
    expires_at: "", // Optional expires date
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [announcementsRes, coursesRes] = await Promise.all([
        api.get("/instructor/announcements"),
        api.get("/courses/my"),
      ]);

      if (announcementsRes.data.success) {
        setAnnouncements(announcementsRes.data.data.all || []);
      }

      if (coursesRes.data.data) {
        setMyCourses(coursesRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityConfig = (priority: string) => {
    return priorityConfig[priority as PriorityType] || priorityConfig.normal;
  };

  // Filter & Sort announcements
  const filteredAndSortedAnnouncements = announcements
    .filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.content || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === "mine") {
        // Fallback check for created_by id string/number comparison
        return matchesSearch && String(a.created_by) === String(user?.id);
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      const aDate = new Date(a.published_at || a.created_at).getTime();
      const bDate = new Date(b.published_at || b.created_at).getTime();

      const aWeight = getPriorityConfig(a.priority).weight;
      const bWeight = getPriorityConfig(b.priority).weight;

      switch (sortOrder) {
        case "oldest":
          return aDate - bDate;
        case "priority_high": // Highest priority first (Urgent -> Info)
          return bWeight - aWeight || bDate - aDate;
        case "priority_low": // Lowest priority first (Info -> Urgent)
          return aWeight - bWeight || bDate - aDate;
        case "newest":
        default:
          return bDate - aDate;
      }
    });

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert("Mohon lengkapi judul dan konten pengumuman.");
      return;
    }

    // Map frontend priority to backend
    const priorityMap: Record<PriorityType, string> = {
      info: "low",
      normal: "normal",
      important: "high",
      urgent: "urgent",
      low: "low",
      medium: "normal",
      high: "high",
    };

    const payload = {
      ...newAnnouncement,
      priority: priorityMap[newAnnouncement.priority],
      target_classes: newAnnouncement.targetClasses,
    };

    try {
      if (editingId) {
        // Update existing announcement
        await api.put(`/instructor/announcements/${editingId}`, payload);
        alert("Pengumuman berhasil diperbarui!");
      } else {
        // Create new announcement
        await api.post("/instructor/announcements", payload);
        alert("Pengumuman berhasil dibuat!");
      }

      // Reset & Refresh
      handleCancelEdit();
      fetchData();
    } catch (error) {
      console.error("Failed to save announcement:", error);
      alert("Gagal menyimpan pengumuman. Silakan coba lagi.");
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingId(announcement.id);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      targetClasses: announcement.target_classes || [],
      priority: announcement.priority,
      published_at: announcement.published_at || "",
      expires_at: announcement.expires_at || "",
    });
    setShowCreateModal(true);
    setExpandedId(null);
  };

  const handleDeleteAnnouncement = async (id: string | null) => {
    if (!id) return;

    try {
      await api.delete(`/instructor/announcements/${id}`);
      alert("Pengumuman berhasil dihapus");
      setShowDeleteConfirm(null);
      setExpandedId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      alert("Gagal menghapus pengumuman");
    }
  };

  const handleCancelEdit = () => {
    setShowCreateModal(false);
    setEditingId(null);
    setNewAnnouncement({
      title: "",
      content: "",
      targetClasses: [],
      priority: "normal",
      published_at: "",
      expires_at: "",
    });
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

      {/* Controls: Tabs, Search, Sort */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-white dark:bg-slate-700 text-pln-primary shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Semua Pengumuman
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-600">
                {announcements.length}
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
              Dibuat Saya
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-600">
                {
                  announcements.filter(
                    (a) => String(a.created_by) === String(user?.id),
                  ).length
                }
              </span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder("newest")}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                sortOrder === "newest"
                  ? "bg-white dark:bg-slate-800 text-pln-primary shadow-sm border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              Terbaru
            </button>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value as
                      | "newest"
                      | "oldest"
                      | "priority_high"
                      | "priority_low",
                  )
                }
                className="appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="priority_high">Prioritas Tertinggi</option>
                <option value="priority_low">Prioritas Terendah</option>
              </select>
              <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
          />
        </div>
      </motion.div>

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pln-primary mx-auto mb-4"></div>
            <p className="text-slate-500">Memuat pengumuman...</p>
          </div>
        ) : filteredAndSortedAnnouncements.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <MegaphoneIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Belum ada pengumuman
            </h3>
            <p className="text-slate-500 mt-1">
              {searchQuery
                ? "Tidak ada pengumuman yang cocok dengan pencarian"
                : activeTab === "mine"
                  ? "Anda belum membuat pengumuman apapun"
                  : "Belum ada pengumuman aktif saat ini"}
            </p>
            {activeTab === "mine" && !searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-pln-primary bg-pln-primary/10 rounded-lg hover:bg-pln-primary/20 transition-colors"
              >
                Buat Pengumuman
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedAnnouncements.map((announcement, index) => {
              const config = getPriorityConfig(announcement.priority);
              const PriorityIcon = config.icon;
              const isMyAnnouncement =
                String(announcement.created_by) === String(user?.id);

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
                          {announcement.target_classes &&
                            announcement.target_classes.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded bg-pln-primary/10 dark:bg-pln-primary/20 text-pln-primary">
                                <UserGroupIcon className="w-3 h-3" />
                                {announcement.target_classes.includes("all")
                                  ? "Semua Kelas"
                                  : `${announcement.target_classes.length} Kelas`}
                              </span>
                            )}
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {announcement.date ||
                              new Date(
                                announcement.published_at ||
                                  announcement.created_at,
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                          </span>
                          <span>•</span>
                          <span>
                            {announcement.creator?.name || "Admin"} -{" "}
                            {announcement.creator_role || "Administrator"}
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
                              <div
                                className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-lg [&_h3]:font-bold"
                                dangerouslySetInnerHTML={{
                                  __html: announcement.content,
                                }}
                              />
                              {(isMyAnnouncement || activeTab === "mine") && (
                                <div className="mt-4 flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditAnnouncement(announcement);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  >
                                    <PencilIcon className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDeleteConfirm(announcement.id);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                  >
                                    <TrashIcon className="w-3 h-3" />
                                    Hapus
                                  </button>
                                </div>
                              )}
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
            })}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={handleCancelEdit}
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
                {/* Target Classes Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Target Kelas
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                    <label
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        newAnnouncement.targetClasses.includes("all")
                          ? "bg-pln-primary/5 border-pln-primary ring-1 ring-pln-primary"
                          : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-pln-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-pln-primary rounded border-slate-300 focus:ring-pln-primary"
                        checked={newAnnouncement.targetClasses.includes("all")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAnnouncement({
                              ...newAnnouncement,
                              targetClasses: ["all"],
                            });
                          } else {
                            setNewAnnouncement({
                              ...newAnnouncement,
                              targetClasses: [],
                            });
                          }
                        }}
                      />
                      <div>
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">
                          Semua Kelas
                        </span>
                        <span className="block text-xs text-slate-500">
                          Kirim ke seluruh peserta kelas Anda
                        </span>
                      </div>
                    </label>

                    {myCourses.map((course) => (
                      <label
                        key={course.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          newAnnouncement.targetClasses.includes(
                            String(course.id),
                          )
                            ? "bg-pln-primary/5 border-pln-primary ring-1 ring-pln-primary"
                            : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-pln-primary/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-pln-primary rounded border-slate-300 focus:ring-pln-primary"
                          checked={newAnnouncement.targetClasses.includes(
                            String(course.id),
                          )}
                          onChange={(e) => {
                            const id = String(course.id);
                            let newTargets = [...newAnnouncement.targetClasses];

                            if (e.target.checked) {
                              // If selecting specific class, remove 'all'
                              newTargets = newTargets.filter(
                                (t) => t !== "all",
                              );
                              newTargets.push(id);
                            } else {
                              newTargets = newTargets.filter((t) => t !== id);
                            }

                            setNewAnnouncement({
                              ...newAnnouncement,
                              targetClasses: newTargets,
                            });
                          }}
                          disabled={newAnnouncement.targetClasses.includes(
                            "all",
                          )}
                        />
                        <div className="min-w-0">
                          <span className="block text-sm font-medium text-slate-900 dark:text-white truncate">
                            {course.title || course.name}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {course.participants_count || 0} Peserta
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {(newAnnouncement.targetClasses || []).includes("all")
                      ? "📢 Pengumuman akan dikirim ke semua peserta di seluruh kelas Anda"
                      : (newAnnouncement.targetClasses || []).length === 0
                        ? "⚠️ Pilih minimal satu kelas atau 'Semua Kelas'"
                        : `✓ ${(newAnnouncement.targetClasses || []).length} kelas dipilih`}
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
                  <RichTextEditor
                    value={newAnnouncement.content}
                    onChange={(value) =>
                      setNewAnnouncement({ ...newAnnouncement, content: value })
                    }
                    placeholder="Tulis pengumuman di sini..."
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <InformationCircleIcon className="w-3 h-3" />
                    Tips: Gunakan formatting untuk memperjelas pesan
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

                {/* Scheduling - Publish & Expires Date (Optional) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal Publish
                    </label>
                    <DateTimePicker
                      value={newAnnouncement.published_at}
                      onChange={(value) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          published_at: value,
                        })
                      }
                      placeholder="Pilih tanggal publish"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Opsional - Kosongkan untuk publish sekarang
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal Kadaluarsa
                    </label>
                    <DateTimePicker
                      value={newAnnouncement.expires_at}
                      onChange={(value) =>
                        setNewAnnouncement({
                          ...newAnnouncement,
                          expires_at: value,
                        })
                      }
                      placeholder="Pilih tanggal kadaluarsa"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Opsional - Pengumuman otomatis hilang setelah tanggal ini
                    </p>
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
                    (newAnnouncement.targetClasses || []).length === 0
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
