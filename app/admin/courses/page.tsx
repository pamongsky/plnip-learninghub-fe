"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import {
  AcademicCapIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  UserGroupIcon,
  PencilSquareIcon,
  CalendarIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { coursesApi, Course } from "@/lib/api/courses";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getAll();
      // Handle pagination structure if needed
      setCourses(data.data || []);
    } catch (error) {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const res = await coursesApi.sync() as { message: string };
      toast.success(res.message);
      await loadCourses();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Gagal sinkronisasi"
        : error instanceof Error ? error.message : "Gagal sinkronisasi";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.short_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0" />
        </div>

        {/* Search & Table Skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-4 p-6">
          <div className="h-10 w-full md:w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />

          {/* Table Skeleton */}
          <div className="space-y-3 mt-6">
            {/* Header row */}
            <div className="flex gap-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>

            {/* Data rows */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Admin
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
                Manajemen Kelas
              </h1>
              <p className="text-slate-500 mt-1 dark:text-slate-400">
                Kelola kursus dan sinkronisasi dengan Moodle (LMS)
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSync}
              disabled={loading}
              className="bg-gradient-to-r from-pln-primary to-pln-light"
            >
              <ArrowPathIcon
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Menyinkronkan..." : "Sync Kelas dari Moodle"}
            </Button>
          </div>
        </motion.div>

        {/* Filters & Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari kelas..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead>Nama Kelas</TableHead>
                      <TableHead>Kode (Moodle)</TableHead>
                      <TableHead>Instruktur</TableHead>
                      <TableHead>Siswa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <AcademicCapIcon className="h-10 w-10 text-slate-300" />
                            <p className="text-slate-500">
                              Tidak ada kelas ditemukan
                            </p>
                            <Button
                              variant="outline"
                              onClick={handleSync}
                              disabled={loading}
                            >
                              <ArrowPathIcon
                                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                              />
                              {loading
                                ? "Menyinkronkan..."
                                : "Sync Kelas Pertama"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCourses.map((course) => (
                        <TableRow
                          key={course.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                {course.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-normal"
                                >
                                  ID: {course.moodle_course_id || "Not Synced"}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 font-mono text-sm whitespace-nowrap">
                            {course.short_name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {course.instructor ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0">
                                  {course.instructor.name.charAt(0)}
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                  {course.instructor.name}
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1 text-slate-600">
                              <UserGroupIcon className="w-4 h-4 flex-shrink-0" />
                              <span>{course.enrollments_count || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {course.is_active ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <EllipsisHorizontalIcon className="h-5 w-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/courses/${course.id}`}>
                                    <PencilSquareIcon className="mr-2 h-4 w-4" />
                                    Detail & Enroll
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
