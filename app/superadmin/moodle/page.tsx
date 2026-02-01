"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UsersIcon,
  AcademicCapIcon,
  ServerIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/axios";

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

// Mock sync status
const syncStatus = {
  connection: "connected",
  lastSync: "2026-01-22 08:30:15",
  nextScheduled: "2026-01-22 12:00:00",
  moodleVersion: "4.3.2",
  apiEndpoint: "https://lms.plnip.co.id/webservice/rest/server.php",
};

const syncStats = [
  {
    title: "Users Synced",
    value: 5120,
    lastSync: "08:30",
    status: "success",
    icon: UsersIcon,
    color: "from-pln-primary to-pln-light",
  },
  {
    title: "Courses Synced",
    value: 245,
    lastSync: "08:30",
    status: "success",
    icon: AcademicCapIcon,
    color: "from-pln-primary to-pln-light",
  },
  {
    title: "Enrollments",
    value: 12840,
    lastSync: "08:30",
    status: "success",
    icon: DocumentTextIcon,
    color: "from-pln-primary to-pln-light",
  },
  {
    title: "Pending Sync",
    value: 12,
    lastSync: "-",
    status: "pending",
    icon: ClockIcon,
    color: "from-pln-primary to-pln-light",
  },
];

const syncHistory = [
  {
    id: 1,
    type: "Full Sync",
    startTime: "2026-01-22 08:30:00",
    endTime: "2026-01-22 08:30:15",
    status: "success",
    usersAdded: 5,
    usersUpdated: 23,
    coursesAdded: 0,
    coursesUpdated: 2,
  },
  {
    id: 2,
    type: "User Sync",
    startTime: "2026-01-22 06:00:00",
    endTime: "2026-01-22 06:00:08",
    status: "success",
    usersAdded: 12,
    usersUpdated: 45,
    coursesAdded: 0,
    coursesUpdated: 0,
  },
  {
    id: 3,
    type: "Course Sync",
    startTime: "2026-01-21 23:00:00",
    endTime: "2026-01-21 23:00:22",
    status: "success",
    usersAdded: 0,
    usersUpdated: 0,
    coursesAdded: 3,
    coursesUpdated: 8,
  },
  {
    id: 4,
    type: "Full Sync",
    startTime: "2026-01-21 20:00:00",
    endTime: "2026-01-21 20:00:18",
    status: "warning",
    usersAdded: 8,
    usersUpdated: 15,
    coursesAdded: 1,
    coursesUpdated: 5,
  },
  {
    id: 5,
    type: "Full Sync",
    startTime: "2026-01-21 12:00:00",
    endTime: "2026-01-21 12:00:12",
    status: "error",
    usersAdded: 0,
    usersUpdated: 0,
    coursesAdded: 0,
    coursesUpdated: 0,
  },
];

export default function SuperadminMoodlePage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  const handleSync = async (type: string) => {
    setIsSyncing(true);
    showToast({ type: "info", message: `Memulai ${type}...` });

    try {
      let endpoint = "";
      if (type === "Course Sync") {
        endpoint = "/courses/sync";
      } else {
        // Placeholder for other syncs
        setTimeout(() => {
          setIsSyncing(false);
          showToast({
            type: "success",
            message: `${type} berhasil (Simulasi)!`,
          });
        }, 2000);
        return;
      }

      const response = await api.post(endpoint);

      showToast({
        type: "success",
        message: response.data.message || `${type} berhasil!`,
      });
    } catch (error: any) {
      console.error("Sync Error:", error);
      showToast({
        type: "error",
        message: error.response?.data?.message || `Gagal melakukan ${type}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Success
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Warning
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Error
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Moodle Sync
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Monitor dan kelola sinkronisasi dengan Moodle LMS
            </p>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary"
            onClick={() => handleSync("Full Sync")}
            disabled={isSyncing}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </motion.div>

        {/* Connection Status */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-xl p-4 ${syncStatus.connection === "connected" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    {syncStatus.connection === "connected" ? (
                      <CheckCircleIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {syncStatus.connection === "connected"
                        ? "Terhubung ke Moodle"
                        : "Tidak Terhubung"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {syncStatus.apiEndpoint}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">Last Sync</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {syncStatus.lastSync}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Next Scheduled</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {syncStatus.nextScheduled}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Moodle Version</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {syncStatus.moodleVersion}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sync Stats */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {syncStats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 text-white shadow-lg`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  {getStatusBadge(stat.status)}
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                </div>
                {stat.lastSync !== "-" && (
                  <p className="mt-2 text-xs text-slate-400">
                    Last sync: {stat.lastSync}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Sync Actions</CardTitle>
              <CardDescription>
                Jalankan sinkronisasi untuk data tertentu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => handleSync("User Sync")}
                  disabled={isSyncing}
                >
                  <UsersIcon className="h-6 w-6" />
                  <span>Sync Users</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => handleSync("Course Sync")}
                  disabled={isSyncing}
                >
                  <AcademicCapIcon className="h-6 w-6" />
                  <span>Sync Courses</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => handleSync("Enrollment Sync")}
                  disabled={isSyncing}
                >
                  <DocumentTextIcon className="h-6 w-6" />
                  <span>Sync Enrollments</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sync History */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Riwayat sinkronisasi terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Waktu Mulai</TableHead>
                    <TableHead>Waktu Selesai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Users</TableHead>
                    <TableHead className="text-right">Courses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncHistory.map((sync) => (
                    <TableRow key={sync.id}>
                      <TableCell className="font-medium">{sync.type}</TableCell>
                      <TableCell className="text-slate-500">
                        {sync.startTime}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {sync.endTime}
                      </TableCell>
                      <TableCell>{getStatusBadge(sync.status)}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-emerald-600">
                          +{sync.usersAdded}
                        </span>
                        {" / "}
                        <span className="text-blue-600">
                          ↻{sync.usersUpdated}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-emerald-600">
                          +{sync.coursesAdded}
                        </span>
                        {" / "}
                        <span className="text-blue-600">
                          ↻{sync.coursesUpdated}
                        </span>
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
