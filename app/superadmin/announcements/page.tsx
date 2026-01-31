"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MegaphoneIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Mock announcements data
const announcements = [
  {
    id: 1,
    title: "Update Sistem Portal PLN IP Learning Hub",
    content:
      "Portal PLN IP Learning Hub telah diupdate dengan fitur-fitur baru untuk meningkatkan pengalaman belajar Anda.",
    priority: "high",
    status: "published",
    scope: "global",
    views: 4521,
    publishedAt: "2026-01-22",
    expiresAt: "2026-02-22",
    createdBy: "Super Admin",
  },
  {
    id: 2,
    title: "Jadwal Maintenance LMS Moodle",
    content:
      "LMS Moodle akan mengalami maintenance rutin pada tanggal 25 Januari 2026 pukul 00:00 - 04:00 WIB.",
    priority: "high",
    status: "published",
    scope: "global",
    views: 3892,
    publishedAt: "2026-01-21",
    expiresAt: "2026-01-26",
    createdBy: "Super Admin",
  },
  {
    id: 3,
    title: "Kebijakan Baru Akses Platform",
    content:
      "Mulai Februari 2026, akses ke platform learning memerlukan autentikasi dua faktor (2FA).",
    priority: "medium",
    status: "draft",
    scope: "global",
    views: 0,
    publishedAt: null,
    expiresAt: "2026-03-01",
    createdBy: "Super Admin",
  },
  {
    id: 4,
    title: "Program Sertifikasi Baru 2026",
    content:
      "PLN IP membuka program sertifikasi baru untuk bidang energi terbarukan dan digital transformation.",
    priority: "medium",
    status: "published",
    scope: "global",
    views: 2156,
    publishedAt: "2026-01-20",
    expiresAt: "2026-06-30",
    createdBy: "Super Admin",
  },
];

export default function SuperadminAnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Urgent
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Published
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Scheduled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch = ann.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ann.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || ann.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
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
            Pengumuman Global
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Kelola pengumuman untuk seluruh platform
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary">
          <PlusIcon className="h-4 w-4" />
          Buat Pengumuman
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-gradient-to-br from-pln-primary to-pln-light p-3 text-white">
              <GlobeAltIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {announcements.filter((a) => a.status === "published").length}
              </p>
              <p className="text-sm text-slate-500">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-gradient-to-br from-pln-primary to-pln-light p-3 text-white">
              <MegaphoneIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {announcements.filter((a) => a.status === "draft").length}
              </p>
              <p className="text-sm text-slate-500">Draft</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-gradient-to-br from-pln-primary to-pln-light p-3 text-white">
              <MegaphoneIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {announcements.filter((a) => a.priority === "high").length}
              </p>
              <p className="text-sm text-slate-500">Urgent</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-gradient-to-br from-pln-primary to-pln-light p-3 text-white">
              <EyeIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {announcements
                  .reduce((sum, a) => sum + a.views, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">Total Views</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari pengumuman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Priority</SelectItem>
                  <SelectItem value="high">Urgent</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Announcements Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead>Tanggal Publish</TableHead>
                  <TableHead>Expired</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {announcement.title}
                        </p>
                        <p className="text-sm text-slate-500 line-clamp-1">
                          {announcement.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(announcement.priority)}
                    </TableCell>
                    <TableCell>{getStatusBadge(announcement.status)}</TableCell>
                    <TableCell className="text-right">
                      {announcement.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {announcement.publishedAt || "-"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {announcement.expiresAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EllipsisHorizontalIcon className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <EyeIcon className="h-4 w-4" />
                            Lihat
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <PencilSquareIcon className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600">
                            <TrashIcon className="h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
