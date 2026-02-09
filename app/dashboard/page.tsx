"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  PlayCircleIcon,
  AcademicCapIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import MoodleLoginButton from "@/components/MoodleLoginButton";

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  created_by: string;
  published_at: string;
}

interface DashboardData {
  stats: {
    total_courses: number;
    completed_courses: number;
    in_progress_courses: number;
    certificates_earned: number;
    total_learning_hours: number;
    completion_rate: number;
  };
  announcements: Announcement[];
  course_progress: Array<{
    id: number;
    title: string;
    instructor: string;
    category: string;
    image?: string;
    moodle_url?: string;
  }>;
}

// Animated counter
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
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

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const displayName = user?.name || "User";

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Parallel requests for stats and courses
      const [statsRes, coursesRes] = await Promise.all([
        api.get("/dashboard/employee"),
        api.get("/courses/my"),
      ]);

      setDashboardData({
        ...statsRes.data.data,
        course_progress: coursesRes.data.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          instructor: c.instructor?.name || "Instructor",
          category: c.category_id || "General",
          image: c.image,
          moodle_url: c.moodle_url,
        })),
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Kursus",
      value: dashboardData?.stats?.total_courses || 0,
      icon: BookOpenIcon,
      color: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      label: "Selesai",
      value: dashboardData?.stats?.completed_courses || 0,
      icon: CheckCircleIcon,
      color: "text-emerald-600",
      bgLight: "bg-emerald-50",
    },
    {
      label: "Jam Belajar",
      value: dashboardData?.stats?.total_learning_hours || 0,
      icon: ClockIcon,
      color: "text-amber-600",
      bgLight: "bg-amber-50",
      suffix: "h",
    },
    {
      label: "Sertifikat",
      value: dashboardData?.stats?.certificates_earned || 0,
      icon: TrophyIcon,
      color: "text-purple-600",
      bgLight: "bg-purple-50",
    },
  ];

  const courseProgress = dashboardData?.course_progress || [];

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-pln-primary via-pln-dark to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative">
          <p className="text-white/80 text-sm mb-2">{getGreeting()}</p>
          <h1 className="text-2xl font-bold mb-2">{displayName}!</h1>
          <p className="text-white/70 text-sm mb-4">
            Lanjutkan perjalanan belajarmu dan raih sertifikasi baru
          </p>
          <MoodleLoginButton className="bg-white/20 hover:bg-white/30 text-white" />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
          >
            <div
              className={`w-10 h-10 ${stat.bgLight} rounded-lg flex items-center justify-center mb-3`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses In Progress - 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white">
                Kelas Berlangsung
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelas yang sedang Anda ikuti
              </p>
            </div>

            {courseProgress.length === 0 ? (
              <div className="p-8 text-center">
                <AcademicCapIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Belum ada kelas yang diikuti
                </p>
                <Link
                  href="/dashboard/classes"
                  className="inline-block mt-3 text-sm text-pln-primary hover:underline"
                >
                  Jelajahi Kelas
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {courseProgress.map((classItem, index) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                        {classItem.image ? (
                          <img
                            src={classItem.image}
                            alt={classItem.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-pln-primary/10 dark:bg-pln-primary/20 text-pln-primary dark:text-pln-light rounded mb-1">
                          {classItem.category}
                        </span>
                        <h4 className="font-medium text-slate-800 dark:text-white text-sm truncate">
                          {classItem.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Instruktur: {classItem.instructor}
                        </p>
                      </div>
                      {classItem.moodle_url && (
                        <a
                          href={classItem.moodle_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="self-center px-3 py-1.5 rounded-lg bg-pln-primary text-white text-xs font-medium hover:bg-pln-dark transition-all flex items-center gap-1"
                        >
                          <PlayCircleIcon className="w-4 h-4" />
                          Masuk
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pengumuman Hari Ini */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <MegaphoneIcon className="w-5 h-5 text-pln-primary" />
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                  Pengumuman Hari Ini
                </h3>
              </div>
              {(dashboardData?.announcements?.length ?? 0) === 0 ? (
                <div className="p-6 text-center">
                  <MegaphoneIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Belum ada pengumuman hari ini
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {dashboardData?.announcements?.map((ann) => (
                    <Link key={ann.id} href="/dashboard/announcements" className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer">
                      <div className="flex items-start gap-2">
                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          ann.priority === "urgent" ? "bg-red-500" :
                          ann.priority === "high" ? "bg-orange-500" :
                          "bg-blue-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-medium text-sm text-slate-800 dark:text-white truncate">
                              {ann.title}
                            </h4>
                            {(ann.priority === "urgent" || ann.priority === "high") && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                ann.priority === "urgent"
                                  ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                              }`}>
                                {ann.priority === "urgent" ? "Urgent" : "Penting"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {ann.content?.replace(/<[^>]*>/g, "")}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            oleh {ann.created_by}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
