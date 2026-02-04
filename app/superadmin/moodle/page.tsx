"use client";

import { useState, useEffect } from "react";
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
import {
  getMoodleSyncStatus,
  runFullSync,
  syncUsers,
  syncCourses,
  syncEnrollments,
  getSyncHistory,
  type SyncStatus,
  type SyncHistory as SyncHistoryType,
  type SyncResult,
} from "@/lib/api/moodleSync";

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

export default function SuperadminMoodlePage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryType[]>([]);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const { toast, showToast, clearToast } = useToast();

  // Load status on mount & every 30 seconds
  useEffect(() => {
    loadSyncStatus();
    loadSyncHistory();

    const interval = setInterval(() => {
      if (!isSyncing) {
        loadSyncStatus();
        loadSyncHistory();
      }
    }, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [isSyncing]);

  const loadSyncStatus = async () => {
    try {
      const data = await getMoodleSyncStatus();
      setSyncStatus(data);
    } catch (error: any) {
      console.error("Failed to load sync status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyncHistory = async () => {
    try {
      const data = await getSyncHistory();
      setSyncHistory(data.history);
    } catch (error: any) {
      console.error("Failed to load sync history:", error);
    }
  };

  const handleSync = async (type: string) => {
    setIsSyncing(true);
    showToast({ type: "info", message: `Memulai ${type}...` });

    try {
      let result;

      switch (type) {
        case "Full Sync":
          const fullResult = await runFullSync();
          result = fullResult.results.users; // Show users result for now
          showToast({
            type: "success",
            message: `${fullResult.message} - Users: +${fullResult.results.users.added}/↻${fullResult.results.users.updated}, Courses: +${fullResult.results.courses.added}/↻${fullResult.results.courses.updated}`,
          });
          break;

        case "User Sync":
          const userResult = await syncUsers();
          result = userResult.results;
          showToast({
            type: "success",
            message: `${userResult.message} - Added: ${result.added}, Updated: ${result.updated}`,
          });
          break;

        case "Course Sync":
          const courseResult = await syncCourses();
          result = courseResult.results;
          showToast({
            type: "success",
            message: `${courseResult.message} - Added: ${result.added}, Updated: ${result.updated}`,
          });
          break;

        case "Enrollment Sync":
          const enrollResult = await syncEnrollments();
          result = enrollResult.results;
          showToast({
            type: "success",
            message: `${enrollResult.message} - Added: ${result.added}, Updated: ${result.updated}`,
          });
          break;

        default:
          showToast({ type: "error", message: "Unknown sync type" });
          return;
      }

      setLastSyncResult(result);

      // Reload status after sync
      setTimeout(() => {
        loadSyncStatus();
        loadSyncHistory();
      }, 1000);
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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-pln-primary" />
          <p className="mt-2 text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!syncStatus) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2 text-sm text-slate-500">
            Failed to load sync status
          </p>
        </div>
      </div>
    );
  }

  const syncStats = [
    {
      title: "Portal Users",
      value: syncStatus.stats.portal_users,
      synced: syncStatus.stats.synced_users,
      icon: UsersIcon,
      color: "from-pln-primary to-pln-light",
    },
    {
      title: "Portal Courses",
      value: syncStatus.stats.portal_courses,
      synced: syncStatus.stats.synced_courses,
      icon: AcademicCapIcon,
      color: "from-pln-primary to-pln-light",
    },
    {
      title: "Enrollments",
      value: syncStatus.stats.portal_enrollments,
      icon: DocumentTextIcon,
      color: "from-pln-primary to-pln-light",
    },
    {
      title: "Moodle Users",
      value: syncStatus.connection.total_users || 0,
      icon: ServerIcon,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

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
                    className={`rounded-xl p-4 ${
                      syncStatus.connection.status === "connected"
                        ? "bg-emerald-100 dark:bg-emerald-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {syncStatus.connection.status === "connected" ? (
                      <CheckCircleIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {syncStatus.connection.status === "connected"
                        ? "Terhubung ke Moodle"
                        : "Tidak Terhubung"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {syncStatus.connection.database || "Oracle Database"}
                      {syncStatus.connection.error && (
                        <span className="text-red-600">
                          {" "}
                          - {syncStatus.connection.error}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  {syncStatus.last_sync && (
                    <>
                      <div>
                        <p className="text-xs text-slate-500">Last Sync</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {new Date(
                            syncStatus.last_sync.completed_at,
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {syncStatus.last_sync.duration}s
                        </p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-xs text-slate-500">Moodle Version</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {syncStatus.connection.moodle_version || "N/A"}
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
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  {stat.synced !== undefined && (
                    <p className="mt-1 text-xs text-emerald-600">
                      {stat.synced} synced from Moodle
                    </p>
                  )}
                </div>
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
                        {new Date(sync.started_at).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(sync.completed_at).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>{getStatusBadge(sync.status)}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-emerald-600">
                          +{sync.users_added || 0}
                        </span>
                        {" / "}
                        <span className="text-blue-600">
                          ↻{sync.users_updated || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-emerald-600">
                          +{sync.courses_added || 0}
                        </span>
                        {" / "}
                        <span className="text-blue-600">
                          ↻{sync.courses_updated || 0}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {syncHistory.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-slate-500"
                      >
                        Belum ada history sync
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
