"use client";

import React, { useEffect, useState } from "react";
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
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserPlusIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ServerStackIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
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
  total_admins: number;
  total_announcements: number;
  total_partners: number;
  total_courses: number;
  active_sessions: number;
};

type MoodleStatus = {
  connected: boolean;
  last_sync: string;
  users_synced: number;
  courses_synced: number;
  pending_sync: number;
};

type AdminActivity = {
  id: number;
  name: string;
  unit: string;
  last_active: string;
  status: "online" | "offline";
};

type Announcement = {
  id: number;
  title: string;
  scope: string;
  status: string;
  views: number;
  created_at: string;
};

export default function SuperadminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_admins: 0,
    total_announcements: 0,
    total_partners: 0,
    total_courses: 0,
    active_sessions: 0,
  });
  const [moodleStatus, setMoodleStatus] = useState<MoodleStatus>({
    connected: true,
    last_sync: new Date().toISOString(),
    users_synced: 0,
    courses_synced: 0,
    pending_sync: 0,
  });
  const [recentAdmins, setRecentAdmins] = useState<AdminActivity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Get current date formatted
  const getCurrentDate = () => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        // Fetch real data from API endpoints
        const [statsRes, usersRes, announcementsRes, moodleRes] =
          await Promise.all([
            api.get("/dashboard/stats").catch(() => ({ data: { data: {} } })),
            api.get("/users/all").catch(() => ({ data: { data: [] } })),
            api
              .get("/announcements/latest")
              .catch(() => ({ data: { data: [] } })),
            api.get("/moodle/sync/status").catch(() => ({ data: null })),
          ]);

        const statsData = statsRes?.data?.data || statsRes?.data || {};
        const usersData = usersRes?.data?.data || [];
        const announcementsData = announcementsRes?.data?.data || [];
        const moodleData = moodleRes?.data || null;

        // Calculate admin count from users
        const admins = Array.isArray(usersData)
          ? usersData.filter(
              (u: { role?: string; effective_role?: string }) =>
                u.role === "admin" ||
                u.role === "super-admin" ||
                u.effective_role === "admin",
            )
          : [];

        // Get courses count from Moodle connection (NOT stats)
        const coursesCount =
          moodleData?.connection?.total_courses || statsData.total_courses || 0;

        setStats({
          total_users: statsData.total_users || usersData.length || 0,
          total_admins: admins.length || 0,
          total_announcements:
            statsData.total_announcements || announcementsData.length || 0,
          total_partners: statsData.total_partners || 0,
          total_courses: coursesCount,
          active_sessions: 0, // Removed - not tracked in backend
        });

        // Set admin activities from real data
        setRecentAdmins(
          admins
            .slice(0, 4)
            .map(
              (admin: {
                id: number;
                name: string;
                department?: string;
                last_login_at?: string;
                is_active: boolean;
              }) => ({
                id: admin.id,
                name: admin.name,
                unit: admin.department || "Pusat",
                last_active: admin.last_login_at
                  ? new Date(admin.last_login_at).toLocaleDateString("id-ID")
                  : "Belum login",
                // Bug #3 fix: online = logged in within last 24 hours
                status:
                  admin.last_login_at &&
                  new Date(admin.last_login_at) >
                    new Date(Date.now() - 24 * 60 * 60 * 1000)
                    ? "online"
                    : "offline",
              }),
            ),
        );

        setAnnouncements(
          Array.isArray(announcementsData) ? announcementsData.slice(0, 4) : [],
        );

        // Set Moodle status from real API
        // Response: { connection: {status, total_users, total_courses}, stats: {synced_users, synced_courses}, last_sync: {started_at, status} }
        if (moodleData) {
          const isConnected = moodleData.connection?.status === "connected";
          setMoodleStatus({
            connected: isConnected,
            last_sync:
              moodleData.last_sync?.started_at ||
              moodleData.last_sync?.completed_at ||
              new Date().toISOString(),
            users_synced: moodleData.stats?.synced_users || 0,
            courses_synced: moodleData.stats?.synced_courses || 0,
            pending_sync: Math.max(
              0,
              (moodleData.connection?.total_users || 0) -
                (moodleData.stats?.synced_users || 0),
            ),
          });

          // Update courses count from Moodle connection
          if (isConnected && moodleData.connection?.total_courses) {
            setStats((prev) => ({
              ...prev,
              total_courses: moodleData.connection.total_courses,
            }));
          }
        }
      } catch (error) {
        // error handled silently
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const handleMoodleSync = async () => {
    setSyncLoading(true);
    try {
      const response = await api.post("/moodle/sync/full");

      showToast({
        type: "success",
        message: response.data?.message || "Sinkronisasi Moodle berhasil!",
      });

      // Reload BOTH stats and moodle status after sync (Bug #1 & #2 fix)
      const [statsRes, moodleRes] = await Promise.all([
        api.get("/dashboard/stats").catch(() => ({ data: { data: {} } })),
        api.get("/moodle/sync/status").catch(() => ({ data: null })),
      ]);

      const statsData = statsRes?.data?.data || statsRes?.data || {};
      if (statsData.total_users !== undefined) {
        setStats((prev) => ({
          ...prev,
          total_users: statsData.total_users ?? prev.total_users,
          total_courses: statsData.total_courses ?? prev.total_courses,
          total_announcements:
            statsData.total_announcements ?? prev.total_announcements,
        }));
      }

      const moodleData = moodleRes?.data || null;
      if (moodleData) {
        // Bug #2 fix: use connection.status === 'connected', not connection.connected
        const isConnected = moodleData.connection?.status === "connected";
        setMoodleStatus({
          connected: isConnected,
          last_sync:
            moodleData.last_sync?.started_at ||
            moodleData.last_sync?.completed_at ||
            new Date().toISOString(),
          users_synced: moodleData.stats?.synced_users || 0,
          courses_synced: moodleData.stats?.synced_courses || 0,
          pending_sync: Math.max(
            0,
            (moodleData.connection?.total_users || 0) -
              (moodleData.stats?.synced_users || 0),
          ),
        });
      }
    } catch (error: unknown) {
      const errorMsg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Gagal melakukan sinkronisasi"
          : error instanceof Error
            ? error.message
            : "Gagal melakukan sinkronisasi";
      showToast({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setSyncLoading(false);
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
      title: "Total Users",
      value: stats.total_users,
      icon: UserGroupIcon,
      gradient: "from-pln-primary to-pln-600",
      iconBg: "bg-pln-100 dark:bg-pln-900/30",
      iconColor: "text-pln-primary",
    },
    {
      title: "Admin Aktif",
      value: stats.total_admins,
      icon: ShieldCheckIcon,
      gradient: "from-violet-500 to-purple-500",
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600",
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
      icon: AcademicCapIcon,
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600",
    },
  ];

  const quickActions = [
    {
      title: "Kelola User",
      desc: "Manajemen semua user",
      icon: UsersIcon,
      href: "/superadmin/users",
      gradient: "from-pln-primary to-pln-light",
    },
    {
      title: "Roles & Permission",
      desc: "Atur hak akses sistem",
      icon: ShieldCheckIcon,
      href: "/superadmin/roles",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Pengumuman",
      desc: "Broadcast ke semua unit",
      icon: MegaphoneIcon,
      href: "/superadmin/announcements",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      title: "Partner Institusi",
      desc: "Kelola mitra pelatihan",
      icon: BuildingOffice2Icon,
      href: "/superadmin/partners",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Struktur Pimpinan",
      desc: "Kelola hierarki organisasi",
      icon: UserGroupIcon,
      href: "/superadmin/leaders",
      gradient: "from-rose-500 to-pink-500",
    },
    {
      title: "Sinkronisasi LMS",
      desc: "Sync data dengan Moodle",
      icon: ArrowPathIcon,
      href: "/superadmin/moodle",
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 h-48 animate-pulse" />
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
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
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
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-white/80 text-sm mb-2">{getGreeting()}</p>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                  {user?.name || "Super Admin"}
                </h1>
                <p className="text-white/70 text-sm mb-4">
                  Kelola seluruh sistem PLN IP Learning Hub. Pantau aktivitas
                  platform, kelola admin, dan pastikan sistem berjalan optimal.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <MoodleLoginButton
                  roleId={1}
                  className="w-full bg-white text-pln-primary hover:bg-white/90 font-semibold"
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
              Menu Utama
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 h-full transition-shadow hover:shadow-lg text-center"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white mx-auto mb-3 shadow-lg`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {action.desc}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Moodle Sync Status */}
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ServerStackIcon className="h-5 w-5 text-pln-primary" />
                      Status Sinkronisasi LMS
                    </CardTitle>
                    <CardDescription>
                      Koneksi dengan Moodle Learning Management System
                    </CardDescription>
                  </div>
                  <Link href="/superadmin/moodle">
                    <Button variant="outline" size="sm" className="group">
                      Detail
                      <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl mb-4 ${
                      moodleStatus.connected
                        ? "bg-emerald-50 dark:bg-emerald-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                          moodleStatus.connected
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      >
                        {moodleStatus.connected ? (
                          <CheckCircleIcon className="h-6 w-6" />
                        ) : (
                          <ExclamationTriangleIcon className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${
                            moodleStatus.connected
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {moodleStatus.connected
                            ? "Terhubung & Aktif"
                            : "Tidak Terhubung"}
                        </p>
                        <p
                          className={`text-sm ${
                            moodleStatus.connected
                              ? "text-emerald-600 dark:text-emerald-500"
                              : "text-red-600 dark:text-red-500"
                          }`}
                        >
                          Last sync:{" "}
                          {new Date(moodleStatus.last_sync).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}{" "}
                          <span className="font-mono">
                            {new Date(
                              moodleStatus.last_sync,
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleMoodleSync}
                      disabled={syncLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {syncLoading ? (
                        <>
                          <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <ArrowPathIcon className="mr-2 h-4 w-4" />
                          Sync Now
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {moodleStatus.users_synced.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        User Tersinkron
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {moodleStatus.courses_synced.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Kursus Aktif
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
                      <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {moodleStatus.pending_sync}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                        User Belum Sync
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Announcements */}
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MegaphoneIcon className="h-5 w-5 text-amber-500" />
                      Pengumuman
                    </CardTitle>
                    <CardDescription>
                      Pengumuman untuk seluruh platform
                    </CardDescription>
                  </div>
                  <Link href="/superadmin/announcements">
                    <Button variant="outline" size="sm" className="group">
                      Kelola
                      <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {announcements.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                        <MegaphoneIcon className="h-7 w-7 text-amber-500" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mb-3">
                        Belum ada pengumuman
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/superadmin/announcements">
                          Buat Pengumuman
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((announcement, idx) => (
                        <motion.div
                          key={announcement.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Link
                            href="/superadmin/announcements"
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:scale-105 transition-transform">
                                <GlobeAltIcon className="h-5 w-5 text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                  {announcement.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {new Date(
                                    announcement.created_at,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={
                                announcement.status === "published"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-none border-0"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 shadow-none border-0"
                              }
                            >
                              {announcement.status === "published"
                                ? "Published"
                                : "Draft"}
                            </Badge>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            {/* Admin Activity */}
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-violet-500" />
                      Admin Aktif
                    </CardTitle>
                    <CardDescription>Aktivitas admin terakhir</CardDescription>
                  </div>
                  <Link href="/superadmin/users?role=admin">
                    <Button variant="ghost" size="sm" className="group">
                      Semua
                      <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {recentAdmins.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
                        <ShieldCheckIcon className="h-7 w-7 text-violet-500" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        Belum ada admin aktif
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentAdmins.map((admin, idx) => (
                        <motion.div
                          key={admin.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-sm font-semibold text-white">
                                {getInitials(admin.name)}
                              </div>
                              {admin.status === "online" && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-800" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white text-sm">
                                {admin.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {admin.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={
                                admin.status === "online"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }
                            >
                              {admin.status === "online" ? "Online" : "Offline"}
                            </Badge>
                            <p className="text-xs text-slate-400 mt-1">
                              {admin.last_active}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Connection Status */}
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ServerStackIcon className="h-5 w-5 text-pln-light" />
                    Status Koneksi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${moodleStatus.connected ? "bg-emerald-500" : "bg-red-500"}`}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Moodle LMS
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${moodleStatus.connected ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {moodleStatus.connected ? "Terhubung" : "Terputus"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          API Backend
                        </span>
                      </div>
                      <span className="text-sm font-medium text-emerald-600">
                        Aktif
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Database
                        </span>
                      </div>
                      <span className="text-sm font-medium text-emerald-600">
                        Aktif
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Info Card */}
            <motion.div variants={itemVariants}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-pln-50 to-white dark:from-pln-900/20 dark:to-slate-900">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pln-primary text-white flex-shrink-0">
                      <GlobeAltIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                        Integrasi LMS
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Data kursus dan user tersinkronisasi dengan Moodle LMS.
                        Lakukan sync berkala untuk data terbaru.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
