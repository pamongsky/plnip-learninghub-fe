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
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  UserPlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import MoodleLoginButton from "@/components/MoodleLoginButton";

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
  visible: { opacity: 1, y: 0 },
};

type StatCard = {
  title: string;
  value: number;
  change: string;
  trend: "up" | "down";
  icon: typeof UsersIcon;
  color: string;
  bgColor: string;
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

const buildStatCards = (stats?: {
  total_users?: number;
  total_announcements?: number;
  total_courses?: number;
}): StatCard[] => [
  {
    title: "Total User",
    value: stats?.total_users ?? 0,
    change: "",
    trend: "up",
    icon: UsersIcon,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "User Aktif",
    value: stats?.total_users ?? 0,
    change: "",
    trend: "up",
    icon: CheckCircleIcon,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    title: "Pengumuman Aktif",
    value: stats?.total_announcements ?? 0,
    change: "",
    trend: "up",
    icon: MegaphoneIcon,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    title: "Total Kursus",
    value: stats?.total_courses ?? 0,
    change: "",
    trend: "up",
    icon: DocumentChartBarIcon,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
];
const quickActions = [
  {
    title: "Tambah User",
    desc: "Daftarkan user baru",
    icon: UserPlusIcon,
    href: "/admin/users/create",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Buat Pengumuman",
    desc: "Publikasikan info terbaru",
    icon: MegaphoneIcon,
    href: "/admin/announcements/create",
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Lihat Laporan",
    desc: "Analisis data unit",
    icon: DocumentChartBarIcon,
    href: "/admin/reports",
    color: "from-purple-500 to-pink-500",
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statCards, setStatCards] = useState<StatCard[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<
    LatestAnnouncement[]
  >([]);
  const recentUsers: Array<{
    id: number;
    name: string;
    email: string;
    department?: string;
    status?: string;
    joinedAt?: string;
  }> = [];
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const [statsRes, latestRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/announcements/latest"),
        ]);

        setStatCards(buildStatCards(statsRes?.data?.data));

        const latest = latestRes?.data?.data;
        setRecentAnnouncements(Array.isArray(latest) ? latest : []);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Gagal memuat dashboard admin.";
        setErrorMessage(message);
        setStatCards(buildStatCards());
        setRecentAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            Aktif
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Pending
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            Nonaktif
          </Badge>
        );
      case "published":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            Draft
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Tinggi
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            Sedang
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Rendah
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        {toast && <Toast {...toast} onClose={clearToast} />}
        {/* Header Skeleton */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <Skeleton className="h-5 w-28 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        {toast && <Toast {...toast} onClose={clearToast} />}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center max-w-md w-full shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-red-900/30">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">
            Gagal Memuat Data
          </h3>
          <p className="text-slate-500 mb-6 dark:text-slate-400">
            {errorMessage}
          </p>
          <Button onClick={() => window.location.reload()}>
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast {...toast} onClose={clearToast} />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Panel Administrator
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Kelola user, pengumuman, dan laporan unit Anda
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <stat.icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              {/* Gradient accent */}
              <div
                className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color} opacity-0 transition-opacity group-hover:opacity-100`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 dark:text-white">
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {action.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Users */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">User Terbaru</CardTitle>
                  <CardDescription>
                    Daftar user yang baru bergabung
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/users">
                    Lihat Semua
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bergabung</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {userItem.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {userItem.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {userItem.department}
                        </TableCell>
                        <TableCell>{getStatusBadge(userItem.status)}</TableCell>
                        <TableCell className="text-slate-500">
                          {new Date(userItem.joinedAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Announcements */}
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pengumuman</CardTitle>
                  <CardDescription>Pengumuman terbaru</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/announcements">
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                        {announcement.title}
                      </p>
                      {getPriorityBadge(announcement.priority)}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {new Date(announcement.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {announcement.views}
                      </span>
                      {getStatusBadge(announcement.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card className="mt-6 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Aktivitas Hari Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <UserPlusIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        5 user baru terdaftar
                      </p>
                      <p className="text-xs text-slate-500">2 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <MegaphoneIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        1 pengumuman dipublikasi
                      </p>
                      <p className="text-xs text-slate-500">5 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <DocumentChartBarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Laporan mingguan tersedia
                      </p>
                      <p className="text-xs text-slate-500">Hari ini</p>
                    </div>
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
