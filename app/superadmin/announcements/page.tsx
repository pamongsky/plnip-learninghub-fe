"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  MegaphoneIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  ChevronDownIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  ChartBarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ArrowsUpDownIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "@/lib/axios";
import { getEcho, disconnectEcho } from "@/lib/echo";

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
  id: number;
  title: string;
  content: string;
  priority: string;
  created_by_id: number | null; // Add this
  created_by: string;
  creator_role: string;
  creator?: {
    id: number;
    name: string;
    department?: string;
    position?: string;
  };
  created_at: string;
  published_at: string | null;
  expires_at: string | null;
  views: number;
  is_active: boolean;
  status: string;
}

interface Stats {
  total_announcements: number;
  active_announcements: number;
  by_priority: {
    high: number;
    medium: number;
    low: number;
  };
  by_creator_role: Record<string, number>;
}

export default function SuperadminAnnouncementsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [activePriority, setActivePriority] = useState<
    "all" | "info" | "normal" | "important"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  // Edit & Delete States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal" as PriorityType,
    published_at: "",
    expires_at: "",
  });
  const [saving, setSaving] = useState(false);

  const getMappedPriority = (priority: string): PriorityType => {
    const priorityMapReverse: Record<string, PriorityType> = {
      informasi: "info",
      umum: "normal",
      penting: "important",
    };
    return priorityMapReverse[priority] || "normal";
  };

  useEffect(() => {
    fetchData();

    // Real-time listener for new announcements
    const echo = getEcho();
    if (echo) {
      const channel = echo.channel("announcements");
      channel.listen(".announcement.created", (data: any) => {
        console.log("New announcement received:", data);
        fetchData(); // Refresh data
      });
    }

    return () => {
      const echo = getEcho();
      if (echo) {
        echo.leaveChannel("announcements");
      }
    };
  }, []); // Remove user dependency to avoid infinite loop if user changes, though fetchData depends on user

  // Add dependency on user to filter correctly when user loads
  useEffect(() => {
    if (user && announcements.length > 0) {
      // Re-filter if user arrives late
      const mineFiltered = announcements.filter(
        (ann: Announcement) => ann.created_by_id === user.id,
      );
      setMyAnnouncements(mineFiltered);
    }
  }, [user, announcements]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [announcementsRes, statsRes] = await Promise.all([
        axios.get("/superadmin/announcements"),
        axios.get("/superadmin/announcements/tracking"),
      ]);

      const allAnnouncements = announcementsRes.data.data;

      // Separate announcements
      setAnnouncements(allAnnouncements);

      // Filter announcements created by super admin
      // Note: Use created_by_id if available, fallback to role check if needed (but now we have ID)
      if (user) {
        const mineFiltered = allAnnouncements.filter(
          (ann: Announcement) => ann.created_by_id === user.id,
        );
        setMyAnnouncements(mineFiltered);
      } else {
        // Fallback or empty if user not loaded yet
        setMyAnnouncements([]);
      }

      setStats(statsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Judul dan konten harus diisi");
      return;
    }

    // Map frontend priority to backend values
    const priorityMap: Record<PriorityType, string> = {
      info: "informasi",
      normal: "umum",
      important: "penting",
    };

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        priority: priorityMap[formData.priority],
        published_at: formData.published_at || undefined,
        expires_at: formData.expires_at || undefined,
      };

      if (editingId) {
        await axios.put(`/superadmin/announcements/${editingId}`, payload);
        toast.success("Pengumuman berhasil diperbarui!");
      } else {
        await axios.post("/superadmin/announcements", payload);
        toast.success("Pengumuman berhasil dipublikasikan!");
      }

      handleCancelEdit();
      fetchData();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan pengumuman",
      );
      console.error("Failed to save announcement:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingId(ann.id);

    setFormData({
      title: ann.title,
      content: ann.content,
      priority: getMappedPriority(ann.priority),
      published_at: ann.published_at || "",
      expires_at: ann.expires_at || "",
    });
    setShowCreateModal(true);
    setExpandedId(null);
  };

  const handleDeleteAnnouncement = async (id: number | null) => {
    if (!id) return;
    try {
      await axios.delete(`/superadmin/announcements/${id}`);
      toast.success("Pengumuman berhasil dihapus");
      setShowDeleteConfirm(null);
      setExpandedId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      toast.error("Gagal menghapus pengumuman");
    }
  };

  const handleCancelEdit = () => {
    setShowCreateModal(false);
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      published_at: "",
      expires_at: "",
    });
  };

  const getPriorityConfig = (priority: string) => {
    // Map backend priority to frontend
    const priorityMap: Record<string, PriorityType> = {
      informasi: "info",
      umum: "normal",
      penting: "important",
    };
    const mappedPriority = priorityMap[priority] || "normal";
    return priorityConfig[mappedPriority];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Filter and sort announcements
  const filterAndSort = (announcements: Announcement[]) => {
    let filtered = announcements.filter((ann) => {
      const matchesSearch =
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (activePriority === "all") return matchesSearch;

      const mapped = getMappedPriority(ann.priority);
      return matchesSearch && mapped === activePriority;
    });

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredAllAnnouncements = filterAndSort(announcements);
  const filteredMyAnnouncements = filterAndSort(myAnnouncements);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Super Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Kelola Pengumuman
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 dark:text-slate-400">
            Buat dan kelola pengumuman platform
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

      {/* Stats Dashboard - Compact */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {/* Total */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Total
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                  {stats.total_announcements}
                </p>
              </div>
              <ChartBarIcon className="w-10 h-10 text-blue-200 dark:text-blue-800" />
            </div>
          </div>

          {/* Active */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Aktif
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                  {stats.active_announcements}
                </p>
              </div>
              <MegaphoneIcon className="w-10 h-10 text-green-200 dark:text-green-800" />
            </div>
          </div>

          {/* Penting */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Penting
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                  {stats.by_priority.high}
                </p>
              </div>
              <BellAlertIcon className="w-10 h-10 text-red-200 dark:text-red-800" />
            </div>
          </div>

          {/* My Announcements */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Dibuat Saya
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {myAnnouncements.length}
                </p>
              </div>
              <UserGroupIcon className="w-10 h-10 text-purple-200 dark:text-purple-800" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs - Like Admin */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
            {myAnnouncements.length}
          </span>
        </button>
      </motion.div>

      {/* Search + Sort Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col xl:flex-row gap-3"
      >
        {/* Search */}
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

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Priority Filters */}
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
          {/* Sort Dropdown */}
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
        </div>
      </motion.div>

      {/* Create Modal */}
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
              className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header - Sticky */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {editingId ? "Edit Pengumuman" : "Buat Pengumuman"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingId
                      ? "Perbarui konten pengumuman"
                      : "Publikasikan untuk seluruh platform"}
                  </p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Target Audience Info */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Pengumuman Global
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      Akan dikirim ke seluruh user platform (Admin, Instructor,
                      dan Peserta)
                    </p>
                  </div>
                </div>

                {/* Priority - Modern Grid Radio Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tingkat Prioritas <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(priorityConfig) as PriorityType[]).map(
                      (key) => {
                        const config = priorityConfig[key];
                        const PriorityIcon = config.icon;
                        const isSelected = formData.priority === key;

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
                                setFormData({
                                  ...formData,
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
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Contoh: Maintenance Server Terjadwal"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pln-primary"
                  />
                </div>

                {/* Content - Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Konten Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) =>
                      setFormData({ ...formData, content: value })
                    }
                    placeholder="Tulis pengumuman di sini..."
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <InformationCircleIcon className="w-3 h-3" />
                    Tips: Gunakan formatting untuk memperjelas pesan
                  </p>
                </div>

                {/* Scheduling - Publish & Expires Date (Optional) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Tanggal Publish
                    </label>
                    <DateTimePicker
                      value={formData.published_at}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
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
                      value={formData.expires_at}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
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

              {/* Modal Footer - Sticky */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                  disabled={saving}
                >
                  Batalkan
                </button>
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={
                    saving ||
                    !formData.title ||
                    !formData.content ||
                    formData.content.length < 20
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-pln-primary text-white rounded-lg hover:bg-pln-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingId ? (
                    "Perbarui"
                  ) : (
                    "Publikasikan"
                  )}
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

      {/* Announcements List - All Tab */}
      {activeTab === "all" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 border-4 border-pln-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Memuat pengumuman...
              </p>
            </div>
          ) : filteredAllAnnouncements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada pengumuman
              </p>
            </div>
          ) : (
            filteredAllAnnouncements.map((announcement, index) => {
              const mappedPriority = getMappedPriority(announcement.priority);

              const config = getPriorityConfig(mappedPriority);
              const PriorityIcon = config.icon;
              const isMine =
                announcement.created_by === "Super Admin" ||
                announcement.creator_role === "super-admin"; // Simple check

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all"
                >
                  <div
                    className="p-4 cursor-pointer"
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
                          <span>
                            {announcement.creator?.name || "Super Admin"} -{" "}
                            {announcement.creator_role || "Administrator"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {announcement.created_by}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(announcement.created_at)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-3 h-3" />
                            {announcement.views}
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
                                className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-lg [&_h3]:font-bold"
                                dangerouslySetInnerHTML={{
                                  __html: announcement.content,
                                }}
                              />
                              {/* Admin Actions */}
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

      {/* Announcements List - Mine Tab */}
      {activeTab === "mine" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 border-4 border-pln-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Memuat pengumuman...
              </p>
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

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all"
                >
                  <div
                    className="p-4 cursor-pointer"
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
                            <CheckCircleIcon className="w-3 h-3" />
                            {announcement.status}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(announcement.created_at)}
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
                                className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-lg [&_h3]:font-bold"
                                dangerouslySetInnerHTML={{
                                  __html: announcement.content,
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
    </div>
  );
}
