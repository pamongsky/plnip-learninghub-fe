"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  AcademicCapIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  ChartBarIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import MoodleLoginButton from "@/components/MoodleLoginButton";

// Animated counter
function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name || "Instruktur";

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Mock stats
  const stats = [
    { label: "Kelas Aktif", value: 5, icon: AcademicCapIcon, color: "pln" },
    { label: "Total Peserta", value: 127, icon: UserGroupIcon, color: "blue" },
    {
      label: "Pertanyaan Hari Ini",
      value: 8,
      icon: QuestionMarkCircleIcon,
      color: "amber",
      link: "/instructor/questions",
    },
    { label: "Kelas Selesai", value: 12, icon: CheckBadgeIcon, color: "green" },
  ];

  // Mock classes
  const myClasses = [
    {
      id: 1,
      title: "Dasar-Dasar Pembangkit Listrik",
      participants: 32,
      schedule: "Senin & Rabu, 09:00",
      status: "active",
    },
    {
      id: 2,
      title: "Keselamatan Kerja (K3)",
      participants: 28,
      schedule: "Selasa & Kamis, 14:00",
      status: "active",
    },
    {
      id: 3,
      title: "Transformator & Distribusi",
      participants: 24,
      schedule: "Jumat, 10:00",
      status: "upcoming",
    },
  ];

  // Mock announcements
  const announcements = [
    {
      id: 1,
      title: "Update Sistem Penilaian Baru",
      date: "22 Jan 2026",
      priority: "high",
    },
    {
      id: 2,
      title: "Jadwal Libur Nasional",
      date: "20 Jan 2026",
      priority: "normal",
    },
  ];

  const colorMap: Record<
    string,
    { bg: string; text: string; bgLight: string }
  > = {
    pln: {
      bg: "bg-pln-primary",
      text: "text-pln-primary",
      bgLight: "bg-pln-primary/10 dark:bg-pln-primary/20",
    },
    blue: {
      bg: "bg-blue-500",
      text: "text-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-500/10",
    },
    amber: {
      bg: "bg-amber-500",
      text: "text-amber-600",
      bgLight: "bg-amber-50 dark:bg-amber-500/10",
    },
    green: {
      bg: "bg-emerald-500",
      text: "text-emerald-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-purple-600",
      bgLight: "bg-purple-50 dark:bg-purple-500/10",
    },
  };

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pln-primary via-pln-light to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <pattern
              id="instructor-grid"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 8 0 L 0 0 0 8"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100" height="100" fill="url(#instructor-grid)" />
          </svg>
        </div>
        <div className="relative">
          <p className="text-white/80 text-sm">{getGreeting()}</p>
          <h1 className="text-2xl font-bold mt-1">{displayName}!</h1>
          <p className="text-white/70 text-sm mt-2">
            Kelola kelas dan pantau progress peserta Anda
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <MoodleLoginButton className="bg-white text-pln-primary hover:bg-white/90" />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => {
          const colors = colorMap[stat.color];
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 ${colors.bgLight} rounded-lg flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                <AnimatedCounter value={stat.value} />
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Classes - 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Kelas Saya
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kelas yang Anda kelola
                </p>
              </div>
              <Link
                href="/instructor/classes"
                className="text-xs text-pln-primary dark:text-pln-light hover:underline font-medium flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {myClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white flex-shrink-0">
                      <AcademicCapIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded ${
                            cls.status === "active"
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {cls.status === "active" ? "Aktif" : "Akan Datang"}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-800 dark:text-white text-sm truncate">
                        {cls.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="w-3 h-3" />
                          {cls.participants} peserta
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {cls.schedule}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/instructor/classes/${cls.id}`}
                      className="px-3 py-1.5 rounded-lg bg-pln-primary text-white text-xs font-medium hover:bg-pln-dark transition-all flex items-center gap-1"
                    >
                      <PlayCircleIcon className="w-4 h-4" />
                      Masuk
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Attendance Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Rata-rata Kehadiran</p>
                <p className="text-xl font-bold">87%</p>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-[87%] bg-gradient-to-r from-pln-primary to-pln-light rounded-full" />
            </div>
            <p className="text-xs text-white/60 mt-2">
              Tingkat kehadiran peserta di semua kelas Anda
            </p>
          </motion.div>

          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                Pengumuman
              </h3>
              <Link
                href="/instructor/announcements"
                className="text-[10px] text-pln-primary dark:text-pln-light hover:underline font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  href="/instructor/announcements"
                  className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        announcement.priority === "high"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white text-xs line-clamp-1">
                        {announcement.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {announcement.date}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
