"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
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

// Mock data - all users from all units
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
    name: "Admin Pusat",
    email: "admin.pusat@plnip.co.id",
    employeeId: "PLN-ADM-001",
    department: "Pusat",
    position: "Administrator",
    role: "admin",
    status: "active",
    joinedAt: "2024-01-10",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    email: "dewi.lestari@plnip.co.id",
    employeeId: "PLN-2024-003",
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
    employeeId: "PLN-2024-004",
    department: "Distribusi",
    position: "Technician",
    role: "user",
    status: "inactive",
    joinedAt: "2024-04-01",
  },
  {
    id: 6,
    name: "Super Admin",
    email: "superadmin@plnip.co.id",
    employeeId: "PLN-SA-001",
    department: "IT",
    position: "System Admin",
    role: "superadmin",
    status: "active",
    joinedAt: "2023-01-01",
  },
];

const roleStats = [
  { role: "superadmin", count: 2, color: "bg-pln-primary" },
  { role: "admin", count: 12, color: "bg-pln-600" },
  { role: "instructor", count: 45, color: "bg-pln-500" },
  { role: "user", count: 5189, color: "bg-pln-light" },
];

export default function SuperadminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return (
          <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
            Super Admin
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            Admin
          </Badge>
        );
      case "instructor":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Instructor
          </Badge>
        );
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Aktif
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">Nonaktif</Badge>;
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || user.department === departmentFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
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
            Kelola Semua User
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Kelola user dari seluruh unit dan role
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </Button>
          <Link href="/superadmin/users/create">
            <Button className="gap-2 bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary">
              <PlusIcon className="h-4 w-4" />
              Tambah User
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Role Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        {roleStats.map((stat) => (
          <Card key={stat.role} className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`h-12 w-1.5 rounded-full ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.count.toLocaleString()}
                </p>
                <p className="text-sm capitalize text-slate-500">{stat.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari nama, email, atau employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Unit</SelectItem>
                  <SelectItem value="Pusat">Pusat</SelectItem>
                  <SelectItem value="Pembangkitan">Pembangkitan</SelectItem>
                  <SelectItem value="Transmisi">Transmisi</SelectItem>
                  <SelectItem value="Distribusi">Distribusi</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-sm font-semibold text-white">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.employeeId}
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-slate-500">
                      {user.joinedAt}
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
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <PencilSquareIcon className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <ShieldCheckIcon className="h-4 w-4" />
                            Ubah Role
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
