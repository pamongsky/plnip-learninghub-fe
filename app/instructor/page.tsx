"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import api from "@/lib/axios";
import {
  AcademicCapIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  ChartBarIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/button";

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  created_by: string;
  published_at: string;
}

interface InstructorDashboardData {
  stats: {
    active_classes: number;
    total_participants: number;
    completed_classes: number;
    average_attendance: number;
  };
  announcements: Announcement[];
  classes: Array<{
    id: number;
    title: string;
    description: string;
    participants: number;
    schedule: string;
    status: "active" | "upcoming" | "completed";
    progress: number;
    moodle_url?: string;
  }>;
}

// Animated counter component
function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } },
};

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<InstructorDashboardData | null>(null);
  const [questionStats, setQuestionStats] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayName = user?.name || "Instruktur";
  const firstName = displayName.split(" ")[0];

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
    fetchQuestionStats();

    // Set up real-time listener for question stats
    const echo = (window as unknown as { Echo?: { channel: (name: string) => { listen: (event: string, callback: (data: unknown) => void) => void } } }).Echo;
    if (echo) {
      echo
        .channel("instructor-dashboard")
        .listen(".question.answered", (data: unknown) => {
          // Decrement unanswered count
          setQuestionStats((prev) => Math.max(0, prev - 1));
        });
    }

    return () => {
      if (echo) {
        echo.leave("instructor-dashboard");
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/instructor");
      setDashboardData(res.data.data);
    } catch (error) {
      setDashboardData({
        stats: {
          active_classes: 0,
          total_participants: 0,
          completed_classes: 0,
          average_attendance: 87,
        },
        announcements: [] as Announcement[],
        classes: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionStats = async () => {
    try {
      const res = await api.get("/instructor/question-stats");
      setQuestionStats(res.data.data?.unanswered || 0);
    } catch (error) {
      // error handled silently
    }
  };

  const handleMoodleAccess = async () => {
    try {
      const response = await api.post("/moodle/login-url");
      if (response.data?.success && response.data?.login_url) {
        window.open(response.data.login_url, "_blank");
      }
    } catch (error) {
      // error handled silently
    }
  };

  const stats = [
    {
      label: "Kelas Aktif",
      value: dashboardData?.stats?.active_classes || 0,
      icon: AcademicCapIcon,
      gradient: "from-pln-primary to-pln-600",
      bgLight: "bg-pln-50 dark:bg-pln-900/20",
      textColor: "text-pln-primary dark:text-pln-light",
    },
    {
      label: "Total Learners",
      value: dashboardData?.stats?.total_participants || 0,
      icon: UserGroupIcon,
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Pertanyaan",
      value: questionStats,
      icon: QuestionMarkCircleIcon,
      gradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Kelas Selesai",
      value: dashboardData?.stats?.completed_classes || 0,
      icon: CheckBadgeIcon,
      gradient: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const myClasses = (dashboardData?.classes || []).slice(0, 4);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pln-primary via-pln-600 to-pln-light p-6 md:p-8 text-white"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm mb-2">{getGreeting()}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {displayName}
            </h1>
            <p className="text-white/70 text-sm mb-4">
              Manage classes and monitor learner progress with ease
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleMoodleAccess}
              className="bg-white text-pln-primary hover:bg-white/90 font-semibold shadow-lg shadow-pln-900/20"
            >
              <AcademicCapIcon className="h-4 w-4 mr-2" />
              Akses LMS Moodle
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          : stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Gradient accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}
                />

                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgLight} transition-transform group-hover:scale-110`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="mt-4">
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Classes - 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pln-50 dark:bg-pln-900/20">
                  <AcademicCapIcon className="h-5 w-5 text-pln-primary dark:text-pln-light" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    Kelas Saya
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kelas yang Anda kelola
                  </p>
                </div>
              </div>
              <Link
                href="/instructor/classes"
                className="text-sm text-pln-primary dark:text-pln-light hover:underline font-medium flex items-center gap-1"
              >
                Lihat Semua
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <div className="p-5 space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                </div>
              ) : myClasses.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-4">
                    <AcademicCapIcon className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Belum ada kelas
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Kelas yang Anda kelola akan muncul di sini
                  </p>
                </div>
              ) : (
                myClasses.map((cls, index) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-pln-primary/20 group-hover:scale-105 transition-transform">
                        <AcademicCapIcon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                              cls.status === "active"
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                : cls.status === "upcoming"
                                  ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                  : "bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {cls.status === "active"
                              ? "Aktif"
                              : cls.status === "upcoming"
                                ? "Akan Datang"
                                : "Selesai"}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-800 dark:text-white truncate">
                          {cls.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <UserGroupIcon className="w-3.5 h-3.5" />
                            {cls.participants} learners
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {cls.schedule}
                          </span>
                        </div>
                      </div>
                      <Link href={`/instructor/classes/${cls.id}`}>
                        <Button
                          size="sm"
                          className="bg-pln-primary hover:bg-pln-600 text-white font-medium shadow-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <PlayCircleIcon className="w-4 h-4 mr-1" />
                          Masuk
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pengumuman Hari Ini */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
              <MegaphoneIcon className="w-5 h-5 text-pln-primary dark:text-pln-light" />
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
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {dashboardData?.announcements?.map((ann) => (
                  <Link
                    key={ann.id}
                    href="/instructor/announcements"
                    className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          ann.priority === "penting"
                            ? "bg-orange-500"
                            : ann.priority === "umum"
                              ? "bg-slate-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm text-slate-800 dark:text-white truncate">
                            {ann.title}
                          </h4>
                          {ann.priority === "penting" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                              Penting
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
          </motion.div>

          {/* Attendance Stats */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 text-white"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pln-primary/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <ChartBarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium">
                    Rata-rata Kehadiran
                  </p>
                  <p className="text-2xl font-bold">
                    <AnimatedCounter
                      value={dashboardData?.stats?.average_attendance || 87}
                      suffix="%"
                    />
                  </p>
                </div>
              </div>

              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${dashboardData?.stats?.average_attendance || 87}%`,
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-pln-primary to-pln-light rounded-full"
                />
              </div>
              <p className="text-xs text-white/50 mt-3">
                Learner attendance rate in all your classes
              </p>
            </div>
          </motion.div>

          {/* Quick Tip */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-gradient-to-br from-pln-50 to-pln-100 dark:from-pln-900/20 dark:to-pln-800/20 p-5 border border-pln-200/50 dark:border-pln-800/50"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pln-primary/10">
                <SparklesIcon className="h-5 w-5 text-pln-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
                  Tips Mengajar
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Gunakan fitur kuis di Moodle untuk meningkatkan interaksi dan
                  learner engagement in your classes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
