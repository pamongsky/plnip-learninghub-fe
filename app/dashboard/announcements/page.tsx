"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import {
  MegaphoneIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  BellAlertIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  BellIcon,
  BookOpenIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

// Priority configuration - matches backend: low, medium, high
const priorityConfig = {
  low: {
    label: "Rendah",
    color: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400",
    iconBg: "bg-slate-50 dark:bg-slate-500/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    icon: InformationCircleIcon,
  },
  medium: {
    label: "Sedang",
    color: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: ExclamationTriangleIcon,
  },
  high: {
    label: "Penting",
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
  priority: PriorityType;
  published_at: string;
  is_active: boolean;
  creator?: {
    id: number;
    name: string;
    department?: string;
    position?: string;
  };
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

function AnnouncementsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "announcements";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Selalu fetch announcements, baik untuk tab announcements maupun notifications
    fetchAnnouncements();
  }, [selectedType, searchQuery]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (selectedType !== "all") {
        params.priority = selectedType;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get("/announcements", { params });

      if (response.data.success) {
        setAnnouncements(response.data.data.announcements || []);
        setPagination(response.data.data.pagination || null);
      }
    } catch (err: any) {
      console.error("Failed to fetch announcements:", err);
      setError(err.response?.data?.message || "Gagal memuat pengumuman");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityConfig = (priority: string) => {
    return priorityConfig[priority as PriorityType] || priorityConfig.medium;
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const aTime = new Date(a.published_at).getTime();
    const bTime = new Date(b.published_at).getTime();
    return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pengumuman</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Informasi terbaru dari PLN IP Learning Hub</p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4"
      >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  selectedType === "all"
                    ? "bg-pln-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <MegaphoneIcon className="w-3 h-3" />
                Semua
              </button>
              <button
                onClick={() => setSelectedType("high")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  selectedType === "high"
                    ? "bg-pln-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <BellAlertIcon className="w-3 h-3" />
                Penting
              </button>
              <button
                onClick={() => setSelectedType("medium")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  selectedType === "medium"
                    ? "bg-pln-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <ExclamationTriangleIcon className="w-3 h-3" />
                Sedang
              </button>
              <button
                onClick={() => setSelectedType("low")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  selectedType === "low"
                    ? "bg-pln-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <InformationCircleIcon className="w-3 h-3" />
                Rendah
              </button>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Urutkan</span>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                    className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                  </select>
                  <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
              </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <ArrowPathIcon className="w-8 h-8 text-pln-primary animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center border border-red-200 dark:border-red-800"
            >
              <ExclamationCircleIcon className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
              <button
                onClick={fetchAnnouncements}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </motion.div>
          )}

          {/* Announcements List */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {announcements.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Tidak ada pengumuman</p>
                </div>
              ) : (
                sortedAnnouncements.map((announcement, index) => {
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
                        onClick={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                            <PriorityIcon className={`w-6 h-6 ${config.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">{announcement.title}</h3>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {formatDate(announcement.published_at)}
                              </span>
                              {announcement.creator && (
                                <>
                                  <span>•</span>
                                  <span>{announcement.creator.name}</span>
                                </>
                              )}
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

              {/* Pagination info */}
              {pagination && pagination.total > 0 && (
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">
                  Menampilkan {announcements.length} dari {pagination.total} pengumuman
                </div>
              )}
            </motion.div>
          )}
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnnouncementsContent />
    </Suspense>
  );
}
