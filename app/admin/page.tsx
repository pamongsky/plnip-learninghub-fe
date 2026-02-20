"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import {
  UsersIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  SparklesIcon,
  BookOpenIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MoodleLoginButton from "@/components/MoodleLoginButton";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2 } },
};

type DashboardStats = {
  total_users: number;
  active_users: number;
  total_announcements: number;
  total_courses: number;
  pending_tickets: number;
  total_certificates: number;
};

type LatestAnnouncement = {
  id: number;
  title: string;
  priority?: string | null;
  status?: string | null;
  views?: number | null;
  published_at?: string | null;
  created_at?: string | null;
};

type RecentUser = {
  id: number;
  name: string;
  email: string;
  department?: string;
  position?: string;
  created_at: string;
  is_active?: boolean;
};

type Activity = {
  id: number;
  type: "user" | "announcement" | "course" | "ticket";
  message: string;
  time: string;
  icon: typeof UsersIcon;
  color: string;
  bgColor: string;
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    active_users: 0,
    total_announcements: 0,
    total_courses: 0,
    pending_tickets: 0,
    total_certificates: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    LatestAnnouncement[]
  >([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const { toast, showToast, clearToast } = useToast();

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [statsRes, latestRes, usersRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/announcements/latest"),
          api.get("/users/all").catch(() => ({ data: { data: [] } })),
        ]);

        const statsData = statsRes?.data?.data || statsRes?.data || {};
        setStats({
          total_users: statsData.total_users || 0,
          active_users: statsData.active_users || statsData.total_users || 0,
          total_announcements: statsData.total_announcements || 0,
          total_courses: statsData.total_courses || 0,
          pending_tickets: statsData.pending_tickets || 0,
          total_certificates: statsData.total_certificates || 0,
        });

        const latest = latestRes?.data?.data;
        setRecentAnnouncements(Array.isArray(latest) ? latest.slice(0, 4) : []);

        const usersData = usersRes?.data?.data || [];
        setRecentUsers(
          Array.isArray(usersData)
            ? usersData.slice(0, 5).map((u: RecentUser) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                department: u.department,
                position: u.position,
                created_at: u.created_at,
                is_active: u.is_active,
              }))
            : [],
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Gagal memuat dashboard admin.";
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const getPriorityBadge = (priority?: string | null) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
            Penting
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
            Sedang
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
            Rendah
          </Badge>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const statCards = [
    {
      title: "Total User",
      value: stats.total_users,
      icon: UserGroupIcon,
      gradient: "from-pln-primary to-pln-600",
      iconBg: "bg-pln-100 dark:bg-pln-900/30",
      iconColor: "text-pln-primary",
    },
    {
      title: "User Aktif",
      value: stats.active_users,
      icon: CheckCircleIcon,
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pengumuman",
      value: stats.total_announcements,
      icon: MegaphoneIcon,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600",
    },
    {
      title: "Total Kursus",
      value: stats.total_courses,
      icon: BookOpenIcon,
      gradient: "from-pln-light to-cyan-500",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600",
    },
  ];

  const quickActions = [
    {
      title: "Kelola Kelas",
      desc: "Manage classes and learners",
      icon: AcademicCapIcon,
      href: "/admin/courses",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Support Ticket",
      desc: "Lihat dan balas tiket",
      icon: ChatBubbleLeftRightIcon,
      href: "/admin/support",
      gradient: "from-rose-500 to-pink-500",
    },
    {
      title: "Kelola User",
      desc: "Manajemen data user",
      icon: UsersIcon,
      href: "/admin/users",
      gradient: "from-pln-primary to-pln-light",
    },
    {
      title: "Pengumuman",
      desc: "Kelola pengumuman platform",
      icon: MegaphoneIcon,
      href: "/admin/announcements",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  const activities: Activity[] = [
    {
      id: 1,
      type: "user",
      message: `${stats.active_users} user aktif di sistem`,
      time: "Saat ini",
      icon: UserGroupIcon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      id: 2,
      type: "announcement",
      message: `${stats.total_announcements} pengumuman dipublikasikan`,
      time: "Total",
      icon: MegaphoneIcon,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      id: 3,
      type: "course",
      message: `${stats.total_courses} kursus tersedia`,
      time: "Total",
      icon: BookOpenIcon,
      color: "text-pln-primary",
      bgColor: "bg-pln-100 dark:bg-pln-900/30",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 h-44 animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        {toast && <Toast {...toast} onClose={clearToast} />}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-slate-200 bg-white p-8 text-center max-w-md w-full shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">
            Gagal Memuat Data
          </h3>
          <p className="text-slate-500 mb-6 dark:text-slate-400">
            {errorMessage}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {toast && <Toast {...toast} onClose={clearToast} />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pln-primary via-pln-600 to-pln-light p-6 lg:p-8 text-white">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-pln-100 mb-2">
                  {getGreeting()}
                </p>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                  Administrator
                </h1>
                <p className="text-pln-100 max-w-2xl">
                  Kelola user, pengumuman, sinkronisasi data, dan pantau
                  aktivitas platform PLN IP Learning Hub.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <MoodleLoginButton
                  roleId={2}
                  className="bg-white text-pln-primary hover:bg-white/90"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((stat) => (
            <motion.div
              key={stat.title}
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Gradient line on hover */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Aksi Cepat
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 h-full transition-shadow hover:shadow-lg"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white mb-4 shadow-lg`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {action.desc}
                  </p>
                  <ArrowRightIcon className="absolute top-5 right-5 h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Users */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-pln-primary" />
                    User Terbaru
                  </CardTitle>
                  <CardDescription>
                    User yang baru bergabung ke sistem
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="group">
                  <Link href="/admin/users">
                    Lihat Semua
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <UsersIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Belum ada user terdaftar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((userItem, idx) => (
                      <motion.div
                        key={userItem.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-sm font-semibold text-white">
                            {getInitials(userItem.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {userItem.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {userItem.department || userItem.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={
                              userItem.is_active
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }
                          >
                            {userItem.is_active ? "Aktif" : "Nonaktif"}
                          </Badge>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(userItem.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Announcements */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm mt-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MegaphoneIcon className="h-5 w-5 text-amber-500" />
                    Pengumuman Terbaru
                  </CardTitle>
                  <CardDescription>
                    Pengumuman yang dipublikasikan
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="group">
                  <Link href="/admin/announcements">
                    Lihat Semua
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentAnnouncements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <MegaphoneIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mb-3">
                      Belum ada pengumuman
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/announcements">
                        <PlusCircleIcon className="h-4 w-4 mr-2" />
                        Buat Pengumuman
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {recentAnnouncements.map((announcement, idx) => (
                      <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group rounded-xl border border-slate-100 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-2 flex-1">
                            {announcement.title}
                          </p>
                          {getPriorityBadge(announcement.priority)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {new Date(
                              announcement.created_at || "",
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="h-3.5 w-3.5" />
                            {announcement.views || 0}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Activity Summary */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-violet-500" />
                  Ringkasan
                </CardTitle>
                <CardDescription>Statistik sistem saat ini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, idx) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${activity.bgColor}`}
                      >
                        <activity.icon
                          className={`h-5 w-5 ${activity.color}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {activity.message}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar / Schedule */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-pln-light" />
                  Tanggal Hari Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pln-primary/10 to-pln-light/10 flex items-center justify-center mx-auto mb-3">
                    <CalendarDaysIcon className="h-7 w-7 text-pln-primary" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {new Date().getDate()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date().toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-pln-50 to-white dark:from-pln-900/20 dark:to-slate-900">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pln-primary text-white flex-shrink-0">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Tips Admin
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Pastikan untuk memeriksa tiket support secara berkala
                      untuk memberikan respon cepat kepada user.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
