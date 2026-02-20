"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "@/lib/axios";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
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
import { UserDetailsModal } from "./UserDetailsModal";
import { UserEditModal } from "./UserEditModal";
import { UserDeleteModal } from "./UserDeleteModal";
import { UserOverrideRoleModal } from "./UserOverrideRoleModal";

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

// Types
interface User {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  position: string;
  role?: string;
  effective_role?: string;
  is_active: boolean;
  source: "manual" | "erp";
  access_group?: string;
  role_override?: string;
  created_at: string;
}

export default function SuperadminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]); // Dynamic departments
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Calculate role stats from actual user data
  const roleStats = [
    {
      role: "Super-admin",
      count: users.filter(
        (u) => u.role === "super-admin" || u.effective_role === "super-admin",
      ).length,
      color: "bg-pln-primary",
    },
    {
      role: "Admin",
      count: users.filter(
        (u) => u.role === "admin" || u.effective_role === "admin",
      ).length,
      color: "bg-pln-600",
    },
    {
      role: "Instructor",
      count: users.filter(
        (u) => u.role === "instructor" || u.effective_role === "instructor",
      ).length,
      color: "bg-pln-500",
    },
    {
      role: "Learner",
      count: users.filter(
        (u) =>
          u.role === "learner" ||
          u.effective_role === "learner" ||
          (!u.role && !u.effective_role),
      ).length,
      color: "bg-pln-light",
    },
  ];

  // Modal states
  const [detailsModal, setDetailsModal] = useState({ open: false, userId: 0 });
  const [editModal, setEditModal] = useState({ open: false, userId: 0 });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    userId: 0,
    userName: "",
    version: 0, // Force remount on every open
  });
  const [overrideModal, setOverrideModal] = useState({
    open: false,
    userId: 0,
    userName: "",
    currentRole: "",
    accessGroup: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, sourceFilter, departmentFilter, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        role: roleFilter,
        status: statusFilter,
        source: sourceFilter,
        department: departmentFilter,
        search: searchQuery,
      });

      const response = await axios.get(`/superadmin/users?${params}`);
      setUsers(response.data.data || []);

      // Update dynamic departments list if provided
      if (
        response.data.departments &&
        Array.isArray(response.data.departments)
      ) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super-admin":
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
      case "learner":
      default:
        return <Badge variant="secondary">Learner</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    if (source === "erp") {
      return (
        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          ERP
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
        Manual
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Aktif
        </Badge>
      );
    }
    return <Badge variant="secondary">Nonaktif</Badge>;
  };

  const handleERPSync = async () => {
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      const response = await axios.post("/superadmin/sync-erp");
      setSyncMessage({
        type: "success",
        text: `✅ Sync berhasil: ${response.data.stats.created} baru, ${response.data.stats.updated} diperbarui`,
      });
      // Refresh users list after sync
      setTimeout(() => fetchUsers(), 1000);
    } catch (error) {
      const err = error as any;
      setSyncMessage({
        type: "error",
        text: `❌ Sync gagal: ${err?.response?.data?.error || err?.message}`,
      });
    } finally {
      setSyncLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

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
            Kelola user dari seluruh divisi dan role
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleERPSync}
            disabled={syncLoading}
            variant="outline"
            className="gap-2"
          >
            {syncLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-pln-primary" />
                Sync ERP...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="h-4 w-4" />
                Sync ERP
              </>
            )}
          </Button>
          <Link href="/superadmin/users/create">
            <Button className="gap-2 bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary">
              <PlusIcon className="h-4 w-4" />
              Tambah User
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Sync Message */}
      {syncMessage && (
        <motion.div
          variants={itemVariants}
          className={`p-4 rounded-lg border ${
            syncMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
          }`}
        >
          {syncMessage.text}
        </motion.div>
      )}

      {/* Role Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
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
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cari</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Cari nama, email, atau employee ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Source
                  </label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Source</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="erp">ERP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Divisi
                  </label>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Semua Divisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Divisi</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-slate-500">Memuat data...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500">Tidak ada user ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-sm font-semibold text-white flex-shrink-0">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 dark:text-white truncate">
                                {user.name}
                              </p>
                              <p className="text-sm text-slate-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm whitespace-nowrap">
                          {user.employee_id || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {user.department || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getRoleBadge(user.effective_role || "learner")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getSourceBadge(user.source)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {getStatusBadge(user.is_active)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <EllipsisHorizontalIcon className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onSelect={() =>
                                  setDetailsModal({
                                    open: true,
                                    userId: user.id,
                                  })
                                }
                              >
                                <EyeIcon className="h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onSelect={() =>
                                  setEditModal({ open: true, userId: user.id })
                                }
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {user.source === "manual" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2 text-red-600"
                                    onSelect={() =>
                                      setDeleteModal({
                                        open: true,
                                        userId: user.id,
                                        userName: user.name,
                                        version: Date.now(), // New version per open
                                      })
                                    }
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </>
                              )}
                              {user.source === "erp" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onSelect={() =>
                                      setOverrideModal({
                                        open: true,
                                        userId: user.id,
                                        userName: user.name,
                                        currentRole:
                                          user.effective_role || "learner",
                                        accessGroup: user.access_group || "N/A",
                                      })
                                    }
                                  >
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    Override Role
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <UserDetailsModal
        open={detailsModal.open}
        onOpenChange={(open) => setDetailsModal({ ...detailsModal, open })}
        userId={detailsModal.userId}
      />

      <UserEditModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ ...editModal, open })}
        userId={editModal.userId}
        onSuccess={fetchUsers}
      />

      <UserDeleteModal
        key={deleteModal.version} // Force completely fresh state every time
        open={deleteModal.open}
        onOpenChange={(open) =>
          setDeleteModal({ ...deleteModal, open, version: deleteModal.version })
        }
        userId={deleteModal.userId}
        userName={deleteModal.userName}
        onSuccess={fetchUsers}
      />

      <UserOverrideRoleModal
        open={overrideModal.open}
        onOpenChange={(open) => setOverrideModal({ ...overrideModal, open })}
        userId={overrideModal.userId}
        userName={overrideModal.userName}
        currentRole={overrideModal.currentRole}
        accessGroup={overrideModal.accessGroup}
        onSuccess={fetchUsers}
      />
    </motion.div>
  );
}
