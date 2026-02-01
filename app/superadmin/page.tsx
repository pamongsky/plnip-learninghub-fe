"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserPlusIcon,
  GlobeAltIcon,
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

// Stats data
const platformStats = [
  {
    title: "Total Users",
    value: 5248,
    change: "+18%",
    trend: "up",
    icon: UsersIcon,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Active Admins",
    value: 12,
    change: "+2",
    trend: "up",
    icon: ShieldCheckIcon,
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50 dark:bg-rose-900/20",
  },
  {
    title: "Pengumuman Aktif",
    value: 28,
    change: "+5",
    trend: "up",
    icon: MegaphoneIcon,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    title: "Partner Institusi",
    value: 15,
    change: "+3",
    trend: "up",
    icon: BuildingOffice2Icon,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  },
];

const moodleStatus = {
  lastSync: "2026-01-22 08:30",
  status: "connected",
  usersSync: 5120,
  coursesSync: 245,
  pendingSync: 12,
};

const recentAdmins = [
  {
    id: 1,
    name: "Admin Pusat",
    email: "admin.pusat@plnip.co.id",
    role: "admin",
    unit: "Pusat",
    lastActive: "2 menit lalu",
    status: "online",
  },
  {
    id: 2,
    name: "Admin Pembangkitan",
    email: "admin.pembangkit@plnip.co.id",
    role: "admin",
    unit: "Pembangkitan",
    lastActive: "15 menit lalu",
    status: "online",
  },
  {
    id: 3,
    name: "Admin Transmisi",
    email: "admin.transmisi@plnip.co.id",
    role: "admin",
    unit: "Transmisi",
    lastActive: "1 jam lalu",
    status: "offline",
  },
  {
    id: 4,
    name: "Admin Distribusi",
    email: "admin.distribusi@plnip.co.id",
    role: "admin",
    unit: "Distribusi",
    lastActive: "3 jam lalu",
    status: "offline",
  },
];

const recentAnnouncements = [
  {
    id: 1,
    title: "Update Sistem Portal PLN IP",
    scope: "global",
    status: "published",
    views: 4521,
    createdAt: "2026-01-22",
  },
  {
    id: 2,
    title: "Jadwal Sinkronisasi Moodle",
    scope: "global",
    status: "published",
    views: 3892,
    createdAt: "2026-01-21",
  },
  {
    id: 3,
    title: "Kebijakan Baru Akses LMS",
    scope: "global",
    status: "draft",
    views: 0,
    createdAt: "2026-01-20",
  },
];

const quickActions = [
  {
    title: "Tambah Admin",
    desc: "Daftarkan admin baru",
    icon: UserPlusIcon,
    href: "/superadmin/users/create",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Kelola Roles",
    desc: "Atur hak akses",
    icon: ShieldCheckIcon,
    href: "/superadmin/roles",
    color: "from-rose-500 to-pink-500",
  },
  {
    title: "Company Profile",
    desc: "Edit profil perusahaan",
    icon: BuildingOffice2Icon,
    href: "/superadmin/company",
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Sync Moodle",
    desc: "Sinkronisasi data",
    icon: ArrowPathIcon,
    href: "/superadmin/moodle",
    color: "from-purple-500 to-violet-500",
  },
];

export default function SuperadminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Online
          </Badge>
        );
      case "offline":
        return <Badge variant="secondary">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "global":
        return (
          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            Global
          </Badge>
        );
      case "unit":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Unit
          </Badge>
        );
      default:
        return <Badge variant="outline">{scope}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast {...toast} onClose={clearToast} />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
            Dashboard Super Admin
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Kelola seluruh sistem PLN IP Learning Hub dari satu tempat.
          </p>
        </motion.div>

        {/* Platform Stats */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {platformStats.map((stat) => (
            <Card
              key={stat.title}
              className="relative overflow-hidden border-0 shadow-lg"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl ${stat.bgColor} p-3`}>
                    {React.createElement(stat.icon, {
                      className: `h-6 w-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`,
                      style: { stroke: "url(#gradient)" },
                    })}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}
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
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="group cursor-pointer border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div
                      className={`rounded-xl bg-gradient-to-br ${action.color} p-3 text-white shadow-lg transition-transform group-hover:scale-110`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {action.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {action.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Moodle Status & Recent Admins */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Moodle Sync Status */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Status Moodle</CardTitle>
                  <CardDescription>
                    Sinkronisasi dengan LMS Moodle
                  </CardDescription>
                </div>
                <Link href="/superadmin/moodle">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Detail <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-emerald-500 p-2">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Terhubung
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-500">
                        Last sync: {moodleStatus.lastSync}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <ArrowPathIcon className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {moodleStatus.usersSync.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Users Synced</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {moodleStatus.coursesSync}
                    </p>
                    <p className="text-xs text-slate-500">Courses</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-4 text-center dark:bg-amber-900/20">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {moodleStatus.pendingSync}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500">
                      Pending
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Admins Activity */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Admin Aktif</CardTitle>
                  <CardDescription>Aktivitas admin terakhir</CardDescription>
                </div>
                <Link href="/superadmin/users?role=admin">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Lihat Semua <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-sm font-semibold text-white">
                            {admin.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          {admin.status === "online" && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-800" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {admin.name}
                          </p>
                          <p className="text-xs text-slate-500">{admin.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(admin.status)}
                        <p className="mt-1 text-xs text-slate-400">
                          {admin.lastActive}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Global Announcements */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Pengumuman Global</CardTitle>
                <CardDescription>
                  Pengumuman untuk seluruh platform
                </CardDescription>
              </div>
              <Link href="/superadmin/announcements">
                <Button variant="ghost" size="sm" className="gap-1">
                  Lihat Semua <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">
                        {announcement.title}
                      </TableCell>
                      <TableCell>{getScopeBadge(announcement.scope)}</TableCell>
                      <TableCell>
                        {announcement.status === "published" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {announcement.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {announcement.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
