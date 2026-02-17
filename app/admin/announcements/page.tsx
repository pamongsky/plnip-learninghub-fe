"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
// import { useAuth } from "@/contexts/AuthContext"; // Commented out for Admin context
import api from "@/lib/axios";
import { sanitizeHtml } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  MegaphoneIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
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

// Priority configuration - 3 levels only
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
};

type PriorityType = keyof typeof priorityConfig;

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_role?: "all" | "learner" | "instructor";
  created_at: string;
  published_at?: string;
  expires_at?: string;
  creator?: {
    id: number;
    name: string;
    department?: string;
    position?: string;
  };
  creator_role?: string;
}

export default function AdminAnnouncementsPage() {
  // const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [activePriority, setActivePriority] = useState<
    "all" | "info" | "normal" | "important"
  >("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Data state
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);

  // Form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target_role: "learner" as "all" | "learner" | "instructor", // Role targeting
    priority: "normal" as PriorityType,
    published_at: "", // Optional publish date
    expires_at: "", // Optional expires date
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/announcements");
      if (response.data.success) {
        setAllAnnouncements(response.data.data.all);
        setMyAnnouncements(response.data.data.mine);
      }
    } catch (error) {
      // error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  const getMappedPriority = (priority: string): PriorityType => {
    const priorityMapReverse: Record<string, PriorityType> = {
      informasi: "info",
      umum: "normal",
      penting: "important",
    };
    return priorityMapReverse[priority] || "normal";
  };

  // Filter announcements
  const filteredAllAnnouncements = allAnnouncements
    .filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (activePriority === "all") return matchesSearch;

      const mapped = getMappedPriority(a.priority);
      return matchesSearch && mapped === activePriority;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const filteredMyAnnouncements = myAnnouncements
    .filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (activePriority === "all") return matchesSearch;

      const mapped = getMappedPriority(a.priority);
      return matchesSearch && mapped === activePriority;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Mohon lengkapi judul dan konten pengumuman.");
      return;
    }

    // Map frontend priority to backend values
    const priorityMap: Record<PriorityType, string> = {
      info: "informasi",
      normal: "umum",
      important: "penting",
    };

    try {
      const payload = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        priority: priorityMap[newAnnouncement.priority],
        published_at: newAnnouncement.published_at || undefined,
        expires_at: newAnnouncement.expires_at || undefined,
        target_role: newAnnouncement.target_role,
      };

      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, payload);
        toast.success("Pengumuman berhasil diperbarui!");
      } else {
        await api.post("/admin/announcements", payload);
        toast.success("Pengumuman berhasil dibuat!");
      }

      // Reset form
      handleCancelEdit();

      // Refresh data
      fetchAnnouncements();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Object && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(
        errorMessage || "Gagal menyimpan pengumuman. Silakan coba lagi.",
      );
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingId(announcement.id);

    // Map backend priority back to frontend
    // This logic is now handled by getPriorityConfig
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      target_role: (announcement.target_role === "user" ? "learner" : announcement.target_role || "all") as "all" | "learner" | "instructor",
      priority: getMappedPriority(announcement.priority), // Use the new helper
      published_at: announcement.published_at || "",
      expires_at: announcement.expires_at || "",
    });
    setShowCreateModal(true);
    setExpandedId(null);
  };

  const handleDeleteAnnouncement = async (id: string | null) => {
    if (!id) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      fetchAnnouncements();
      setShowDeleteConfirm(null);
      setExpandedId(null);
      toast.success("Pengumuman berhasil dihapus");
    } catch (error) {
      // error handled silently
      toast.error("Gagal menghapus pengumuman.");
    }
  };

  const handleCancelEdit = () => {
    setShowCreateModal(false);
    setEditingId(null);
    setNewAnnouncement({
      title: "",
      content: "",
      target_role: "learner",
      priority: "normal",
      published_at: "",
      expires_at: "",
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
            Buat dan kelola pengumuman
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActivePriority("all")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activePriority === "all"
                ? "bg-pln-primary text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <MegaphoneIcon className="w-3 h-3" />
            Semua
          </button>
          <button
            onClick={() => setActivePriority("important")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activePriority === "important"
                ? "bg-pln-primary text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <ExclamationTriangleIcon className="w-3 h-3" />
            Penting
          </button>
          <button
            onClick={() => setActivePriority("normal")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activePriority === "normal"
                ? "bg-pln-primary text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <CheckCircleIcon className="w-3 h-3" />
            Umum
          </button>
          <button
            onClick={() => setActivePriority("info")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              activePriority === "info"
                ? "bg-pln-primary text-white shadow-sm"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <InformationCircleIcon className="w-3 h-3" />
            Informasi
          </button>
        </div>

        {/* Sort Order */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "newest" | "oldest")
            }
            className="appearance-none pl-3 pr-8 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary cursor-pointer"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
          <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </motion.div>

      {/* Announcements List - All (Inbox) */}
      {activeTab === "all" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pln-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Memuat pengumuman...</p>
            </div>
          ) : filteredAllAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada pengumuman masuk
              </p>
            </div>
          ) : (
            filteredAllAnnouncements.map((announcement, index) => {
              const mappedPriority = getMappedPriority(announcement.priority);

              const config = getPriorityConfig(mappedPriority);
              const PriorityIcon = config.icon;
              const date = new Date(announcement.created_at).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              );

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
                            {date}
                          </span>
                          <span>•</span>
                          <span>
                            {announcement.creator?.name || "Administrator"} -{" "}
                            {announcement.creator_role || "Admin"}
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
                                  __html: sanitizeHtml(announcement.content),
                                }}
                              />
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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pln-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Memuat pengumuman...</p>
            </div>
          ) : filteredMyAnnouncements.length === 0 ? (
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
              const mappedPriority = getMappedPriority(announcement.priority);
              const config = getPriorityConfig(mappedPriority);
              const PriorityIcon = config.icon;
              const date = new Date(announcement.created_at).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              );

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
                            {announcement.target_role === "all"
                              ? "Learner + Instructor"
                              : announcement.target_role === "learner" || announcement.target_role === "user"
                                ? "Learner Only"
                                : "Instructor Only"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {date}
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
                                  __html: sanitizeHtml(announcement.content),
                                }}
                              />
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
            onClick={handleCancelEdit}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {editingId ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingId
                      ? "Perbarui informasi pengumuman"
                      : "Publikasikan informasi untuk pengguna atau instruktur"}
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
                {/* Target Role Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Target Penerima <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${newAnnouncement.target_role === "learner" ? "border-pln-primary bg-pln-primary/5 dark:bg-pln-primary/10" : "border-slate-200 dark:border-slate-600 hover:border-slate-300"}`}
                    >
                      <input
                        type="radio"
                        name="target_role"
                        value="learner"
                        checked={newAnnouncement.target_role === "learner"}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            target_role: e.target
                              .value as typeof newAnnouncement.target_role,
                          })
                        }
                        className="w-4 h-4 text-pln-primary"
                      />
                      <span className="text-sm font-medium text-slate-800 dark:text-white">
                        👥 Learner Only
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${newAnnouncement.target_role === "instructor" ? "border-pln-primary bg-pln-primary/5 dark:bg-pln-primary/10" : "border-slate-200 dark:border-slate-600 hover:border-slate-300"}`}
                    >
                      <input
                        type="radio"
                        name="target_role"
                        value="instructor"
                        checked={newAnnouncement.target_role === "instructor"}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            target_role: e.target
                              .value as typeof newAnnouncement.target_role,
                          })
                        }
                        className="w-4 h-4 text-pln-primary"
                      />
                      <span className="text-sm font-medium text-slate-800 dark:text-white">
                        👨‍🏫 Instructor Only
                      </span>
                    </label>

                    <label
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${newAnnouncement.target_role === "all" ? "border-pln-primary bg-pln-primary/5 dark:bg-pln-primary/10" : "border-slate-200 dark:border-slate-600 hover:border-slate-300"}`}
                    >
                      <input
                        type="radio"
                        name="target_role"
                        value="all"
                        checked={newAnnouncement.target_role === "all"}
                        onChange={(e) =>
                          setNewAnnouncement({
                            ...newAnnouncement,
                            target_role: e.target
                              .value as typeof newAnnouncement.target_role,
                          })
                        }
                        className="w-4 h-4 text-pln-primary"
                      />
                      <span className="text-sm font-medium text-slate-800 dark:text-white">
                        🌐 Learner + Instructor
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {newAnnouncement.target_role === "learner"
                      ? "Pengumuman hanya akan dikirim ke Learner"
                      : newAnnouncement.target_role === "instructor"
                        ? "Pengumuman hanya akan dikirim ke Instructor"
                        : "Pengumuman akan dikirim ke Learner dan Instructor"}
                  </p>
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

                {/* Content - Rich Text Editor */}
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
              <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={!newAnnouncement.title || !newAnnouncement.content}
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
                  Pengumuman yang dihapus tidak dapat dikembalikan.
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
