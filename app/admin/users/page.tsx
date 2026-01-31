"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Mock data
const users = [
  {
    id: 1,
    name: "Ahmad Fauzi",
    email: "ahmad.fauzi@plnip.co.id",
    employeeId: "PLN-2024-001",
    department: "Pembangkitan",
    position: "Engineer",
    role: "user",
    status: "active",
    joinedAt: "2024-03-15",
  },
  {
    id: 2,
    name: "Siti Rahayu",
    email: "siti.rahayu@plnip.co.id",
    employeeId: "PLN-2024-002",
    department: "Transmisi",
    position: "Supervisor",
    role: "instructor",
    status: "active",
    joinedAt: "2024-02-20",
  },
  {
    id: 3,
    name: "Budi Santoso",
    email: "budi.santoso@plnip.co.id",
    employeeId: "PLN-2024-003",
    department: "Distribusi",
    position: "Technician",
    role: "user",
    status: "pending",
    joinedAt: "2024-04-10",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    email: "dewi.lestari@plnip.co.id",
    employeeId: "PLN-2024-004",
    department: "Corporate",
    position: "Manager",
    role: "admin",
    status: "active",
    joinedAt: "2024-01-05",
  },
  {
    id: 5,
    name: "Rizky Pratama",
    email: "rizky.pratama@plnip.co.id",
    employeeId: "PLN-2024-005",
    department: "Pembangkitan",
    position: "Staff",
    role: "user",
    status: "inactive",
    joinedAt: "2024-03-01",
  },
  {
    id: 6,
    name: "Maya Putri",
    email: "maya.putri@plnip.co.id",
    employeeId: "PLN-2024-006",
    department: "HR",
    position: "Specialist",
    role: "user",
    status: "active",
    joinedAt: "2024-05-12",
  },
  {
    id: 7,
    name: "Agus Wijaya",
    email: "agus.wijaya@plnip.co.id",
    employeeId: "PLN-2024-007",
    department: "Finance",
    position: "Analyst",
    role: "user",
    status: "active",
    joinedAt: "2024-04-25",
  },
  {
    id: 8,
    name: "Linda Kusuma",
    email: "linda.kusuma@plnip.co.id",
    employeeId: "PLN-2024-008",
    department: "IT",
    position: "Developer",
    role: "user",
    status: "active",
    joinedAt: "2024-06-01",
  },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            Admin
          </Badge>
        );
      case "instructor":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Instructor
          </Badge>
        );
      case "user":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
            User
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
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
                Kelola User
              </h1>
              <p className="text-slate-500 mt-1 dark:text-slate-400">
                Kelola data user di unit Anda
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/admin/users/create">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Tambah User
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total User
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {users.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Aktif</p>
            <p className="text-2xl font-bold text-pln-primary">
              {users.filter((u) => u.status === "active").length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pending
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {users.filter((u) => u.status === "pending").length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nonaktif
            </p>
            <p className="text-2xl font-bold text-slate-500">
              {users.filter((u) => u.status === "inactive").length}
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari nama, email, atau ID..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead>User</TableHead>
                      <TableHead>ID Karyawan</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <UsersIcon className="h-10 w-10 text-slate-300" />
                            <p className="text-slate-500">
                              Tidak ada user ditemukan
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((userItem) => (
                        <TableRow
                          key={userItem.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-sm font-semibold text-white">
                                {userItem.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {userItem.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {userItem.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                            {userItem.employeeId}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            <div>
                              <p>{userItem.department}</p>
                              <p className="text-sm text-slate-400">
                                {userItem.position}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(userItem.role)}</TableCell>
                          <TableCell>
                            {getStatusBadge(userItem.status)}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {new Date(userItem.joinedAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
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
                                <DropdownMenuItem>
                                  <EyeIcon className="mr-2 h-4 w-4" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <PencilSquareIcon className="mr-2 h-4 w-4" />
                                  Edit
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500">
                  Menampilkan {filteredUsers.length} dari {users.length} user
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
