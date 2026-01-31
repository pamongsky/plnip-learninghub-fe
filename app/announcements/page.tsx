"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { getStorageUrl, getPriorityColor } from "@/lib/utils";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface Creator {
  id: number;
  name: string;
  department: string;
  position: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  image: string | null;
  priority: "high" | "medium" | "low";
  published_at: string | null;
  created_at: string;
  creator: Creator | null;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get("/announcements", {
        params: {
          page,
          search,
          priority,
          per_page: 9, // Grid 3x3 looks good
        },
      });

      setAnnouncements(response.data.data.announcements);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    // Debounce search slightly to avoid too many requests
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, priority]);


  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <div className="bg-pln-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Papan Pengumuman</h1>
              <p className="mt-2 text-pln-100">
                Informasi terbaru seputar PLN Indonesia Power
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-pln-primary focus:border-pln-primary sm:text-sm"
                placeholder="Cari pengumuman..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to page 1 on search
                }}
              />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-pln-primary focus:border-pln-primary sm:text-sm appearance-none"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Semua Prioritas</option>
                <option value="high">High (Penting)</option>
                <option value="medium">Medium (Info)</option>
                <option value="low">Low (Santai)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow p-4 animate-pulse h-64"
              >
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((item) => (
                <Link
                  href={`/announcements/${item.id}`}
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
                >
                  {/* Image Banner */}
                  <div className="h-48 bg-gray-200 relative">
                    {item.image ? (
                      <img
                        src={getStorageUrl(item.image) || ''}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-pln-50 text-pln-primary">
                        <span className="text-4xl">📢</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide ${getPriorityColor(item.priority)}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                      <span>
                        {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>{item.creator?.name || "Admin"}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <div
                      className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1 prose prose-sm"
                      dangerouslySetInnerHTML={{
                        __html: item.content,
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                  Halaman {pagination.current_page} dari {pagination.last_page}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.last_page, p + 1))
                  }
                  disabled={page === pagination.last_page}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <MagnifyingGlassIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Tidak ada pengumuman
            </h3>
            <p className="mt-2 text-gray-500">
              Coba ubah kata kunci pencarian atau filter prioritas Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
