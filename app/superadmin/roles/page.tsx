"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  UsersIcon,
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

// Permissions list
const allPermissions = [
  { id: "users.view", name: "Lihat User", category: "Users" },
  { id: "users.create", name: "Tambah User", category: "Users" },
  { id: "users.edit", name: "Edit User", category: "Users" },
  { id: "users.delete", name: "Hapus User", category: "Users" },
  {
    id: "announcements.view",
    name: "Lihat Pengumuman",
    category: "Pengumuman",
  },
  {
    id: "announcements.create",
    name: "Buat Pengumuman",
    category: "Pengumuman",
  },
  { id: "announcements.edit", name: "Edit Pengumuman", category: "Pengumuman" },
  {
    id: "announcements.delete",
    name: "Hapus Pengumuman",
    category: "Pengumuman",
  },
  { id: "reports.view", name: "Lihat Laporan", category: "Laporan" },
  { id: "reports.export", name: "Export Laporan", category: "Laporan" },
  { id: "company.edit", name: "Edit Company Profile", category: "Settings" },
  { id: "partners.manage", name: "Kelola Partner", category: "Settings" },
  { id: "moodle.sync", name: "Sync Moodle", category: "Settings" },
  { id: "roles.manage", name: "Kelola Roles", category: "Settings" },
];

// Roles with permissions
const roles = [
  {
    id: 1,
    name: "superadmin",
    displayName: "Super Admin",
    description: "Akses penuh ke seluruh sistem",
    color: "rose",
    userCount: 2,
    permissions: allPermissions.map((p) => p.id), // All permissions
  },
  {
    id: 2,
    name: "admin",
    displayName: "Admin",
    description: "Kelola user dan pengumuman unit",
    color: "purple",
    userCount: 12,
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "announcements.view",
      "announcements.create",
      "announcements.edit",
      "announcements.delete",
      "reports.view",
      "reports.export",
    ],
  },
  {
    id: 3,
    name: "instructor",
    displayName: "Instructor",
    description: "Kelola kelas dan lihat peserta",
    color: "blue",
    userCount: 45,
    permissions: ["announcements.view", "reports.view"],
  },
  {
    id: 4,
    name: "user",
    displayName: "User",
    description: "Akses dasar untuk pembelajaran",
    color: "emerald",
    userCount: 5189,
    permissions: ["announcements.view"],
  },
];

export default function SuperadminRolesPage() {
  const [selectedRole, setSelectedRole] = useState<(typeof roles)[0] | null>(
    null,
  );

  const getRoleColor = (color: string) => {
    const colors: Record<string, string> = {
      rose: "from-pln-primary to-pln-light",
      purple: "from-pln-primary to-pln-light",
      blue: "from-pln-primary to-pln-light",
      emerald: "from-pln-primary to-pln-light",
    };
    return colors[color] || colors.emerald;
  };

  const getRoleBgColor = (color: string) => {
    const colors: Record<string, string> = {
      rose: "bg-pln-100 text-pln-700 dark:bg-pln-900/30 dark:text-pln-400",
      purple: "bg-pln-100 text-pln-700 dark:bg-pln-900/30 dark:text-pln-400",
      blue: "bg-pln-100 text-pln-700 dark:bg-pln-900/30 dark:text-pln-400",
      emerald: "bg-pln-100 text-pln-700 dark:bg-pln-900/30 dark:text-pln-400",
    };
    return colors[color] || colors.emerald;
  };

  const groupedPermissions = allPermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, typeof allPermissions>,
  );

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
            Roles & Permissions
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Kelola hak akses untuk setiap role
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary">
              <PlusIcon className="h-4 w-4" />
              Tambah Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Role Baru</DialogTitle>
              <DialogDescription>
                Buat role baru dengan permissions yang sesuai
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Nama Role</label>
                <Input placeholder="Contoh: supervisor" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input placeholder="Contoh: Supervisor" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Deskripsi</label>
                <Input
                  placeholder="Deskripsi singkat role ini"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Batal</Button>
              <Button className="bg-gradient-to-r from-pln-primary to-pln-light">
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Roles Grid */}
      <motion.div
        variants={itemVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`cursor-pointer border-0 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl ${selectedRole?.id === role.id ? "ring-2 ring-pln-primary" : ""}`}
            onClick={() => setSelectedRole(role)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-xl bg-gradient-to-br ${getRoleColor(role.color)} p-3 text-white shadow-lg`}
                >
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <Badge className={getRoleBgColor(role.color)}>
                  {role.userCount} users
                </Badge>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {role.displayName}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {role.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <CheckIcon className="h-4 w-4" />
                {role.permissions.length} permissions
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Permissions Matrix */}
      {selectedRole && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={`rounded-xl bg-gradient-to-br ${getRoleColor(selectedRole.color)} p-2 text-white`}
                    >
                      <ShieldCheckIcon className="h-5 w-5" />
                    </div>
                    Permissions: {selectedRole.displayName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedRole.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </Button>
                  {selectedRole.name !== "superadmin" &&
                    selectedRole.name !== "user" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Hapus
                      </Button>
                    )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(
                  ([category, permissions]) => (
                    <div key={category}>
                      <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {category}
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {permissions.map((perm) => {
                          const hasPermission =
                            selectedRole.permissions.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              className={`flex items-center justify-between rounded-lg border p-3 transition ${
                                hasPermission
                                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                                  : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                              }`}
                            >
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {perm.name}
                              </span>
                              <Switch
                                checked={hasPermission}
                                disabled={selectedRole.name === "superadmin"}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
