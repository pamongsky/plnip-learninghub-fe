"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import ClassGroupChat from "@/components/chat/ClassGroupChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { coursesApi } from "@/lib/api/courses";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Participant {
  id: number;
  name: string;
  email: string;
  department: string;
  lastActive: string;
  progress: number;
  status: "active" | "inactive";
}

interface ClassData {
  id: number;
  title: string;
  description: string;
  schedule: string;
  startDate: string;
  endDate: string;
  totalSessions: number;
  completedSessions: number;
  moodleUrl: string;
  moodle_course_id?: number;
}

export default function InstructorClassDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [unansweredQuestions, setUnansweredQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [participantsData, setParticipantsData] = useState<Participant[]>([]);

  // Progress tracking state
  interface ProgressData {
    progress: number;
    completed_activities: number;
    total_with_completion: number;
    progress_mode: "grades" | "completion";
    course_grade: number | null;
    last_access: string | null;
    total_activities: number;
    activities: Array<{
      type: string;
      name: string;
      completion_status: number;
      grade: number | null;
      grade_raw: number | null;
      grade_max: number | null;
      has_completion: boolean;
    }>;
  }

  const [progressTarget, setProgressTarget] = useState<Participant | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    fetchClassDetails();
  }, [params.id]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/courses/${params.id}`);

      const course = res.data;

      // Map course data
      const mappedClass: ClassData = {
        id: course.id,
        title: course.title,
        description: course.description || "",
        schedule: course.schedule || "Lihat di Moodle",
        startDate: course.start_date
          ? new Date(course.start_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-",
        endDate: course.end_date
          ? new Date(course.end_date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-",
        totalSessions: course.total_sessions || 0,
        completedSessions: course.completed_sessions || 0,
        moodleUrl: course.moodle_url || "#",
        moodle_course_id: course.moodle_course_id,
      };

      setClassData(mappedClass);

      // Map participants from enrollments
      if (course.enrollments && course.enrollments.length > 0) {
        interface EnrollmentData {
          user: { id: number; name: string; email: string; department?: string };
          last_activity_at: string | null;
          progress: number;
          status: string;
        }
        const mappedParticipants: Participant[] = (course.enrollments as EnrollmentData[])
          .filter((enrollment) => enrollment.user) // Skip enrollments without user
          .map((enrollment) => ({
            id: enrollment.user.id,
            name: enrollment.user.name,
            email: enrollment.user.email,
            department: enrollment.user.department || "-",
            lastActive: getLastActiveText(enrollment.last_activity_at),
            progress: enrollment.progress || 0,
            status: enrollment.status === "active" ? "active" : "inactive",
          }));
        setParticipantsData(mappedParticipants);
      }
    } catch (err: unknown) {
      // error handled silently

      // If 404, course doesn't exist
      // If 401, user not authenticated
      // If 403, user doesn't have permission
    } finally {
      setLoading(false);
    }
  };

  const getLastActiveText = (lastActivity: string | null) => {
    if (!lastActivity) return "Belum pernah";

    const now = new Date();
    const last = new Date(lastActivity);
    const diffMs = now.getTime() - last.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return `${Math.floor(diffDays / 30)} bulan lalu`;
  };

  const handleViewProgress = async (participant: Participant) => {
    if (!classData) return;
    setProgressTarget(participant);
    setProgressData(null);
    setProgressLoading(true);
    try {
      const data = await coursesApi.getUserProgress(classData.id, participant.id) as ProgressData;
      setProgressData(data);
    } catch (err: unknown) {
      let errorMessage = "Gagal memuat data progress";
      if (err instanceof Error) {
        const error = err as any;
        errorMessage = error.response?.data?.message || "Gagal memuat data progress";
      }
      toast.error(errorMessage);
      setProgressTarget(null);
    } finally {
      setProgressLoading(false);
    }
  };

  const getCompletionLabel = (status: number) => {
    switch (status) {
      case 1: return { text: "Selesai", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-500/20" };
      case 2: return { text: "Lulus", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-500/20" };
      case 3: return { text: "Tidak Lulus", color: "text-red-600", bg: "bg-red-100 dark:bg-red-500/20" };
      default: return { text: "Belum", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-700" };
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz": return "📝";
      case "assign": return "📋";
      case "resource": return "📄";
      case "url": return "🔗";
      case "page": return "📃";
      case "forum": return "💬";
      case "book": return "📚";
      case "lesson": return "📖";
      case "feedback": return "📊";
      case "scorm": return "🎓";
      default: return "📌";
    }
  };

  const filteredParticipants = participantsData.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = participantsData.filter(
    (p) => p.status === "active",
  ).length;
  const inactiveCount = participantsData.filter(
    (p) => p.status === "inactive",
  ).length;
  const avgProgress =
    participantsData.length > 0
      ? Math.round(
          participantsData.reduce((acc, p) => acc + p.progress, 0) /
            participantsData.length,
        )
      : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Back button & Header Skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
          <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>

        {/* Info Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-2"
            >
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>

        {/* Schedule Info Skeleton */}
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />

        {/* Participants Section Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden space-y-4 p-6">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Kelas tidak ditemukan
          </p>
          <Link
            href="/instructor/classes"
            className="text-pln-primary hover:underline mt-2 inline-block"
          >
            Kembali ke Daftar Kelas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/instructor/classes"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-pln-primary dark:hover:text-pln-light mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali ke Daftar Kelas
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {classData.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {classData.description}
            </p>
          </div>
          <a
            href={classData.moodleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pln-primary to-pln-light text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pln-primary/25 transition-all"
          >
            <PlayCircleIcon className="w-5 h-5" />
            Buka di Moodle
          </a>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "overview"
                ? "bg-pln-primary text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <InformationCircleIcon className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative ${
              activeTab === "chat"
                ? "bg-pln-primary text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Chat Grup
            {unansweredQuestions > 0 && (
              <span
                className="absolute -top-3 -right-3 bg-red-600 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold border-3 border-white dark:border-slate-800 shadow-lg animate-pulse cursor-pointer hover:bg-red-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("chat");
                  // Could add logic to scroll to first unanswered question
                }}
                title={`${unansweredQuestions} pertanyaan belum dijawab`}
              >
                {unansweredQuestions}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Class Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pln-primary/10 dark:bg-pln-primary/20 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-pln-primary dark:text-pln-light" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">
                    {participantsData.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total Learners
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">
                    {activeCount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Active Learners
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">
                    {inactiveCount}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tidak Aktif
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">
                    {avgProgress}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rata-rata Progress
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Schedule Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-pln-primary to-pln-light rounded-xl p-4 text-white"
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-xs text-white/70">Periode</p>
                  <p className="font-medium text-sm">
                    {classData.startDate} - {classData.endDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-xs text-white/70">Jadwal</p>
                  <p className="font-medium text-sm">{classData.schedule}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-xs text-white/70">Sesi</p>
                  <p className="font-medium text-sm">
                    {classData.completedSessions}/{classData.totalSessions}{" "}
                    selesai
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Participants Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-white">
                Learner List
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage and monitor class learners
              </p>
            </div>

            {/* Search & Filter */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search learners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            {/* Participants Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Learner
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">
                      Unit
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Progress
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                      Terakhir Aktif
                    </th>
                    <th className="w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredParticipants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                              {participant.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {participant.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {participant.department}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                            participant.status === "active"
                              ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {participant.status === "active" ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3" /> Aktif
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3 h-3" /> Tidak Aktif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                participant.progress >= 70
                                  ? "bg-pln-primary"
                                  : participant.progress >= 40
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${participant.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {participant.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {participant.lastActive}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                              <EllipsisVerticalIcon className="w-4 h-4 text-slate-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProgress(participant)}>
                              <ChartBarIcon className="w-4 h-4 mr-2" />
                              Lihat Progress
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredParticipants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No learners found
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Progress Dialog */}
      <Dialog open={!!progressTarget} onOpenChange={(o) => { if (!o) { setProgressTarget(null); setProgressData(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Learner Progress</DialogTitle>
            <DialogDescription>
              {progressTarget?.name} — {progressTarget?.email}
            </DialogDescription>
          </DialogHeader>

          {progressLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-pln-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : progressData ? (
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-pln-primary">{progressData.progress}%</p>
                  <p className="text-xs text-slate-500">Progress</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {progressData.completed_activities}/{progressData.total_with_completion}
                  </p>
                  <p className="text-xs text-slate-500">
                    {progressData.progress_mode === "grades" ? "Dinilai" : "Aktivitas Selesai"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {progressData.course_grade !== null ? `${progressData.course_grade}` : "-"}
                  </p>
                  <p className="text-xs text-slate-500">Nilai Akhir</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress Keseluruhan{progressData.progress_mode === "grades" ? " (berdasarkan nilai)" : ""}</span>
                  <span>{progressData.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progressData.progress >= 70 ? "bg-emerald-500" :
                      progressData.progress >= 40 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${progressData.progress}%` }}
                  />
                </div>
              </div>

              {/* Last Access */}
              <p className="text-xs text-slate-500">
                Terakhir diakses: {progressData.last_access
                  ? new Date(progressData.last_access).toLocaleString("id-ID")
                  : "Belum pernah"}
              </p>

              {/* Activities List */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Daftar Aktivitas ({progressData.total_activities})
                </h4>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-200 dark:divide-slate-700">
                  {progressData.activities.map((activity, idx: number) => {
                    const completion = getCompletionLabel(activity.completion_status);
                    return (
                      <div key={idx} className="flex items-center justify-between px-3 py-2.5 text-sm">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="flex-shrink-0">{getActivityIcon(activity.type)}</span>
                          <div className="min-w-0">
                            <p className="truncate text-slate-800 dark:text-white">{activity.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{activity.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          {activity.grade !== null && (
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              {activity.grade_raw}/{activity.grade_max}
                            </span>
                          )}
                          {activity.has_completion && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${completion.bg} ${completion.color}`}>
                              {completion.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setProgressTarget(null); setProgressData(null); }}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tab Content - Chat */}
      {activeTab === "chat" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-pln-primary" />
              Diskusi Kelas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Group chat with learners - {unansweredQuestions} pertanyaan belum
              dijawab
            </p>
          </div>
          <div className="h-[600px] overflow-hidden">
            <ClassGroupChat
              classId={parseInt(params.id as string)}
              currentUserId={user?.id || 0}
              isInstructor={true}
              onQuestionCountChange={setUnansweredQuestions}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
