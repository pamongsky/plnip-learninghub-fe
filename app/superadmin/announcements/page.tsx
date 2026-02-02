"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "@heroicons/react/24/outline";
import axios from "@/lib/axios";

// Priority configuration - same as admin
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

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  created_by: string;
  creator_role: string;
  created_at: string;
  published_at: string | null;
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
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal" as PriorityType,
    published_at: "",
    expires_at: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      const mineFiltered = allAnnouncements.filter(
        (ann: Announcement) => ann.creator_role === "super-admin",
      );
      setMyAnnouncements(mineFiltered);

      setStats(statsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      alert("Judul dan konten harus diisi");
      return;
    }

    if (formData.content.length < 20) {
      alert("Konten minimal 20 karakter");
      return;
    }

    setSaving(true);
    try {
      await axios.post("/superadmin/announcements", formData);
      alert("Pengumuman berhasil dipublikasikan!");
      setShowCreateModal(false);
      setFormData({
        title: "",
        content: "",
        priority: "normal",
        published_at: "",
        expires_at: "",
      });
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal membuat pengumuman");
      console.error("Failed to create announcement:", error);
    } finally {
      setSaving(false);
    }
  };

  const getPriorityConfig = (priority: string) => {
    // Map backend priority to frontend
    const priorityMap: Record<string, PriorityType> = {
      low: "info",
      medium: "normal",
      high: "important",
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
    let filtered = announcements.filter(
      (ann) =>
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );

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

          {/* Urgent */}
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
        className="flex flex-col sm:flex-row gap-3"
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

        {/* Sort Order */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortOrder("newest")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
              sortOrder === "newest"
                ? "bg-pln-primary text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-pln-primary dark:hover:border-pln-primary"
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Terbaru
          </button>
          <button
            onClick={() => setSortOrder("oldest")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
              sortOrder === "oldest"
                ? "bg-pln-primary text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-pln-primary dark:hover:border-pln-primary"
            }`}
          >
            <ArrowsUpDownIcon className="w-4 h-4" />
            Terlama
          </button>
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
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header - Sticky */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                    Buat Pengumuman
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Publikasikan untuk seluruh platform
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Tingkat Prioritas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as PriorityType,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pln-primary focus:border-pln-primary"
                  >
                    <option value="info">
                      Informasi - Bersifat informatif
                    </option>
                    <option value="normal">
                      Umum - Pengumuman bersifat umum
                    </option>
                    <option value="important">
                      Penting - Perlu diperhatikan
                    </option>
                    <option value="urgent">
                      Urgent - Sangat penting & mendesak
                    </option>
                  </select>
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

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Konten Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Jelaskan detail pengumuman secara lengkap..."
                    rows={6}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pln-primary resize-none"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Minimal 20 karakter
                  </p>
                </div>

                {/* Schedule - 2 columns */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Publish
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          published_at: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pln-primary"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Kosongkan untuk sekarang
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Kadaluarsa
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expires_at: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pln-primary"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Opsional
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer - Sticky */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => setShowCreateModal(false)}
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
                  ) : (
                    "Publikasikan"
                  )}
                </button>
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
              const config = getPriorityConfig(announcement.priority);
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
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}
                      >
                        <PriorityIcon
                          className={`w-5 h-5 ${config.iconColor}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${config.color}`}
                          >
                            {config.label}
                          </span>
                          {announcement.creator_role && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {announcement.creator_role}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
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
                              <p className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
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
              const config = getPriorityConfig(announcement.priority);
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
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}
                      >
                        <PriorityIcon
                          className={`w-5 h-5 ${config.iconColor}`}
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
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(announcement.created_at)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-3 h-3" />
                            {announcement.views} views
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
                              <p className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
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
    </div>
  );
}
