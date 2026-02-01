"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftRightIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/axios";

type ClassStatus = "active" | "upcoming" | "completed";

interface EnrolledClass {
  id: number;
  title: string;
  description?: string | null;
  instructor?: string;
  participants?: number;
  startDate?: string | null;
  endDate?: string | null;
  status: ClassStatus;
  progress?: number;
  moodleUrl?: string | null;
}

export default function UserClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/courses/my");
        const data = res.data?.data || [];

        const normalizeStatus = (
          start?: string | null,
          end?: string | null,
        ): ClassStatus => {
          if (!start && !end) return "active";
          const now = new Date();
          const startDate = start ? new Date(start) : null;
          const endDate = end ? new Date(end) : null;

          if (startDate && now < startDate) return "upcoming";
          if (endDate && now > endDate) return "completed";
          return "active";
        };

        const mapped: EnrolledClass[] = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description || null,
          instructor: c.instructor?.name || "Instructor",
          participants: c.enrollments_count,
          startDate: c.start_date || null,
          endDate: c.end_date || null,
          status: normalizeStatus(c.start_date, c.end_date),
          moodleUrl: c.moodle_url || null,
        }));

        setClasses(mapped);
      } catch (error) {
        console.error("Failed to load classes:", error);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch =
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.instructor || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || cls.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [classes, searchQuery, statusFilter]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Sedang Berlangsung";
      case "upcoming":
        return "Akan Datang";
      case "completed":
        return "Selesai";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Kelas Saya
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelas yang sedang Anda ikuti di PLN IP Learning Hub
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kelas atau instruktur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary appearance-none cursor-pointer dark:text-white"
          >
            <option value="all">Semua Status</option>
            <option value="active">Sedang Berlangsung</option>
            <option value="upcoming">Akan Datang</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
      </motion.div>

      {/* Classes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4"
      >
        {loading && (
          <div className="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
            Memuat kelas Anda...
          </div>
        )}

        {!loading &&
          filteredClasses.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all group"
            >
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white flex-shrink-0">
                    <AcademicCapIcon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${getStatusStyle(cls.status)}`}
                      >
                        {getStatusLabel(cls.status)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-pln-primary dark:group-hover:text-pln-light transition-colors">
                      {cls.title}
                    </h3>
                    {cls.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {cls.description}
                      </p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      Instruktur: {cls.instructor}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      {typeof cls.participants === "number" && (
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          {cls.participants} peserta
                        </span>
                      )}
                      {(cls.startDate || cls.endDate) && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {cls.startDate || "-"} s/d {cls.endDate || "-"}
                        </span>
                      )}
                    </div>

                    {/* Progress bar when available */}
                    {cls.status === "active" &&
                      typeof cls.progress === "number" && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400">
                              Progress Anda
                            </span>
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {cls.progress}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pln-primary to-pln-light rounded-full transition-all"
                              style={{ width: `${cls.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 lg:flex-col">
                    <Link
                      href={`/dashboard/classes/${cls.id}/chat`}
                      className="flex-1 lg:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      Chat Grup
                    </Link>
                    {cls.moodleUrl ? (
                      <a
                        href={cls.moodleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 lg:flex-none px-4 py-2 bg-gradient-to-r from-pln-primary to-pln-light hover:shadow-lg hover:shadow-pln-primary/25 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <PlayCircleIcon className="w-4 h-4" />
                        Buka Moodle
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 lg:flex-none px-4 py-2 bg-slate-200/70 dark:bg-slate-700/70 text-slate-500 dark:text-slate-400 text-sm font-medium rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                        disabled
                      >
                        <PlayCircleIcon className="w-4 h-4" />
                        Moodle belum tersedia
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

        {!loading && filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
              Belum ada kelas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Anda belum terdaftar di kelas manapun. Hubungi admin untuk
              pendaftaran.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
