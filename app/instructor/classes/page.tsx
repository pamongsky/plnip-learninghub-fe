"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import {
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";

interface Class {
  id: number;
  title: string;
  description: string;
  participants: number;
  schedule: string;
  status: "active" | "upcoming" | "completed";
  progress: number;
  moodle_url?: string;
}

export default function InstructorClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/instructor");
      setClasses(res.data.data.classes || []);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter classes based on search and status
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-pln-primary/10 dark:bg-pln-primary/20 text-pln-primary dark:text-pln-light";
      case "upcoming":
        return "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400";
      case "completed":
        return "bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "upcoming":
        return "Akan Datang";
      case "completed":
        return "Selesai";
      default:
        return status;
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
          Kelola dan pantau semua kelas yang Anda ajar
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
            placeholder="Cari kelas..."
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
            <option value="active">Aktif</option>
            <option value="upcoming">Akan Datang</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-pln-primary/10 dark:bg-pln-primary/20 rounded-xl p-4 border border-pln-primary/20 dark:border-pln-primary/30">
          <p className="text-2xl font-bold text-pln-primary dark:text-pln-light">
            {classes.filter((c) => c.status === "active").length}
          </p>
          <p className="text-xs text-pln-primary/70 dark:text-pln-light/70">
            Kelas Aktif
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-100 dark:border-amber-500/20">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {classes.filter((c) => c.status === "upcoming").length}
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
            Akan Datang
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-500/10 rounded-xl p-4 border border-slate-200 dark:border-slate-500/20">
          <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
            {classes.filter((c) => c.status === "completed").length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400/70">
            Selesai
          </p>
        </div>
      </motion.div>

      {/* Classes List */}
      <div className="space-y-4">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Memuat data kelas...
            </p>
          </motion.div>
        ) : filteredClasses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <AcademicCapIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Tidak ada kelas ditemukan
            </p>
          </motion.div>
        ) : (
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
                        className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${getStatusStyle(
                          cls.status,
                        )}`}
                      >
                        {getStatusLabel(cls.status)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-pln-primary dark:group-hover:text-pln-light transition-colors">
                      {cls.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {cls.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {cls.participants} peserta
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {cls.schedule}
                      </span>
                    </div>

                    {/* Progress bar for active classes */}
                    {cls.status === "active" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Progress Kelas</span>
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

                  {/* Action */}
                  <div className="flex gap-2 lg:flex-col">
                    <Link
                      href={`/instructor/classes/${cls.id}`}
                      className="flex-1 lg:flex-none px-4 py-2 bg-gradient-to-r from-pln-primary to-pln-light hover:shadow-lg hover:shadow-pln-primary/25 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <PlayCircleIcon className="w-4 h-4" />
                      Masuk
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
