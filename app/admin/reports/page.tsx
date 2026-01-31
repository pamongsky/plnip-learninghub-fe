"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

// Mock data
const summaryStats = [
  {
    title: "Total Enrollment",
    value: 1248,
    change: "+12%",
    trend: "up",
    icon: UsersIcon,
    description: "vs bulan lalu",
  },
  {
    title: "Course Completed",
    value: 892,
    change: "+8%",
    trend: "up",
    icon: AcademicCapIcon,
    description: "vs bulan lalu",
  },
  {
    title: "Avg. Learning Hours",
    value: "24.5",
    change: "-2%",
    trend: "down",
    icon: ClockIcon,
    description: "per user",
  },
  {
    title: "Completion Rate",
    value: "78%",
    change: "+5%",
    trend: "up",
    icon: DocumentChartBarIcon,
    description: "vs bulan lalu",
  },
];

const departmentStats = [
  {
    department: "Pembangkitan",
    users: 320,
    enrolled: 285,
    completed: 198,
    avgHours: 28.5,
    completionRate: 69,
  },
  {
    department: "Transmisi",
    users: 180,
    enrolled: 165,
    completed: 142,
    avgHours: 32.1,
    completionRate: 86,
  },
  {
    department: "Distribusi",
    users: 250,
    enrolled: 220,
    completed: 175,
    avgHours: 25.8,
    completionRate: 80,
  },
  {
    department: "Corporate",
    users: 150,
    enrolled: 140,
    completed: 120,
    avgHours: 22.3,
    completionRate: 86,
  },
  {
    department: "IT",
    users: 80,
    enrolled: 78,
    completed: 72,
    avgHours: 35.2,
    completionRate: 92,
  },
  {
    department: "HR",
    users: 60,
    enrolled: 55,
    completed: 48,
    avgHours: 20.1,
    completionRate: 87,
  },
];

const topCourses = [
  {
    title: "Digital Maintenance Basics",
    enrollments: 245,
    completions: 198,
    rating: 4.8,
  },
  {
    title: "Safety Leadership Essentials",
    enrollments: 210,
    completions: 185,
    rating: 4.7,
  },
  {
    title: "Energy Transition Playbook",
    enrollments: 180,
    completions: 155,
    rating: 4.9,
  },
  {
    title: "Power Plant Operations 101",
    enrollments: 165,
    completions: 140,
    rating: 4.6,
  },
  {
    title: "Grid Management Fundamentals",
    enrollments: 150,
    completions: 128,
    rating: 4.5,
  },
];

export default function AdminReportsPage() {
  const [periodFilter, setPeriodFilter] = useState("month");

  const getCompletionColor = (rate: number) => {
    if (rate >= 85) return "text-emerald-600";
    if (rate >= 70) return "text-amber-600";
    return "text-red-600";
  };

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
                Laporan Unit
              </h1>
              <p className="text-slate-500 mt-1 dark:text-slate-400">
                Analisis aktivitas pembelajaran di unit Anda
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[160px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="quarter">Kuartal Ini</SelectItem>
                  <SelectItem value="year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          {summaryStats.map((stat) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
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
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 lg:grid-cols-2 mb-8"
        >
          {/* Completion Rate by Department */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">
                Completion Rate per Departemen
              </CardTitle>
              <CardDescription>Persentase penyelesaian kursus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.slice(0, 5).map((dept) => (
                  <div key={dept.department}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {dept.department}
                      </span>
                      <span
                        className={`text-sm font-semibold ${getCompletionColor(dept.completionRate)}`}
                      >
                        {dept.completionRate}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          dept.completionRate >= 85
                            ? "bg-emerald-500"
                            : dept.completionRate >= 70
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${dept.completionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Kursus Terpopuler</CardTitle>
              <CardDescription>Berdasarkan jumlah enrollment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div
                    key={course.title}
                    className="flex items-center gap-4 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {course.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {course.enrollments} enrolled • {course.completions}{" "}
                        completed
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      ⭐ {course.rating}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Department Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Detail per Departemen</CardTitle>
              <CardDescription>
                Statistik lengkap aktivitas pembelajaran
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead>Departemen</TableHead>
                      <TableHead className="text-right">Total User</TableHead>
                      <TableHead className="text-right">Enrolled</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                      <TableHead className="text-right">Avg. Hours</TableHead>
                      <TableHead className="text-right">
                        Completion Rate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentStats.map((dept) => (
                      <TableRow
                        key={dept.department}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {dept.department}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">
                          {dept.users}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">
                          {dept.enrolled}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">
                          {dept.completed}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">
                          {dept.avgHours}h
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${getCompletionColor(dept.completionRate)}`}
                          >
                            {dept.completionRate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-sm text-slate-500">Total Users</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {departmentStats.reduce((sum, d) => sum + d.users, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Enrolled</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {departmentStats.reduce((sum, d) => sum + d.enrolled, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Completed</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {departmentStats.reduce((sum, d) => sum + d.completed, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg. Completion</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {Math.round(
                        departmentStats.reduce(
                          (sum, d) => sum + d.completionRate,
                          0,
                        ) / departmentStats.length,
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
