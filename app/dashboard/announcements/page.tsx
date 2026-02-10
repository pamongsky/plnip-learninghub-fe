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
  CheckCircleIcon,
  ArrowsUpDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Priority configuration - 3 levels only
const priorityConfig = {
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
  // Legacy fallbacks for old data
  informasi: {
    label: "Informasi",
    color: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    icon: InformationCircleIcon,
    weight: 1,
  },
  umum: {
    label: "Umum",
    color:
      "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-400",
    iconBg: "bg-slate-50 dark:bg-slate-500/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    icon: CheckCircleIcon,
    weight: 2,
  },
  penting: {
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
  id: number;
  title: string;
  content: string;
  priority: PriorityType;
  created_at: string;
  published_at: string | null;
  is_active: boolean;
  creator_role?: string;
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

function AnnouncementsContent() {
  const searchParams = useSearchParams();
  // const tab = searchParams.get("tab") || "announcements"; // Not currently used but kept for ref

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedType, searchQuery]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (selectedType !== "all") {
        // Map frontend types to backend priority values
        const mapToBackend: Record<string, string> = {
          info: "informasi",
          normal: "umum",
          important: "penting",
        };
        params.priority = mapToBackend[selectedType] || selectedType;
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPriorityConfig = (priority: string) => {
    return priorityConfig[priority as PriorityType] || priorityConfig.normal;
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const aDate = new Date(a.published_at || a.created_at).getTime();
    const bDate = new Date(b.published_at || b.created_at).getTime();

    return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Pengumuman
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Informasi terbaru dari PLN IP Learning Hub
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4"
      >
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

        <div className="flex flex-wrap gap-2 items-center">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 flex-1">
            <button
              onClick={() => setSelectedType("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                selectedType === "all"
                  ? "bg-pln-primary text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              }`}
            >
              <MegaphoneIcon className="w-3 h-3" />
              Semua
            </button>
            <button
              onClick={() => setSelectedType("important")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                selectedType === "important"
                  ? "bg-pln-primary text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              }`}
            >
              <ExclamationTriangleIcon className="w-3 h-3" />
              Penting
            </button>
            <button
              onClick={() => setSelectedType("normal")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                selectedType === "normal"
                  ? "bg-pln-primary text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              }`}
            >
              <CheckCircleIcon className="w-3 h-3" />
              Umum
            </button>
            <button
              onClick={() => setSelectedType("info")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                selectedType === "info"
                  ? "bg-pln-primary text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              }`}
            >
              <InformationCircleIcon className="w-3 h-3" />
              Informasi
            </button>
          </div>

          {/* Sort Dropdown - No Label */}
          <div className="relative mt-2 sm:mt-0">
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "newest" | "oldest")
              }
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
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
        <motion.div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <MegaphoneIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada pengumuman
              </p>
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
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all group"
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
                        <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-pln-primary transition-colors">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {formatDate(
                              announcement.published_at ||
                                announcement.created_at,
                            )}
                          </span>
                          {announcement.creator && (
                            <>
                              <span>•</span>
                              <span>
                                {announcement.creator?.name || "Super Admin"} -{" "}
                                {announcement.creator_role || "Administrator"}
                              </span>
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
                              <div
                                className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-lg [&_h3]:font-bold"
                                dangerouslySetInnerHTML={{
                                  __html: announcement.content,
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

          {/* Pagination info */}
          {pagination && pagination.total > 0 && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">
              Menampilkan {announcements.length} dari {pagination.total}{" "}
              pengumuman
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
