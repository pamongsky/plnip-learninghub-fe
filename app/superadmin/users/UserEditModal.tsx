"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "@/lib/axios";
import { AlertCircle, CheckCircle } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  position: string;
  role?: string;
  role_override?: string;
  roles?: { name: string }[];
  is_active: boolean;
  source: "manual" | "erp";
}

interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  onSuccess: () => void;
}

export function UserEditModal({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: UserEditModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    role: "",
    is_active: true,
  });

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/superadmin/users/${userId}`);
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        department: response.data.department || "",
        position: response.data.position || "",
        role:
          response.data.role_override || response.data.effective_role || "user",
        is_active: response.data.is_active,
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setMessage({
        type: "error",
        text: "Gagal memuat data user",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await axios.put(`/superadmin/users/${userId}`, formData);
      setMessage({
        type: "success",
        text: "User berhasil diupdate",
      });

      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Gagal mengupdate user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Memuat data user...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {message.text}
              </div>
            )}

            {user?.role_override === "super-admin" ||
            user?.roles?.some((r: any) => r.name === "super-admin") ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  🔒 Protected Super Admin Account
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Role super admin tidak bisa diubah dari sini. Hubungi
                  administrator sistem jika perlu perubahan.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nama lengkap"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Unit</Label>
              <Select
                value={formData.department || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    department: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Pilih unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  <SelectItem value="Pusat">Pusat</SelectItem>
                  <SelectItem value="Pembangkitan">Pembangkitan</SelectItem>
                  <SelectItem value="Transmisi">Transmisi</SelectItem>
                  <SelectItem value="Distribusi">Distribusi</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Jabatan</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="Jabatan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
                disabled={
                  user?.role_override === "super-admin" ||
                  user?.roles?.some((r: any) => r.name === "super-admin")
                }
              >
                <SelectTrigger
                  id="role"
                  disabled={
                    user?.role_override === "super-admin" ||
                    user?.roles?.some((r: any) => r.name === "super-admin")
                  }
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              {user?.source === "erp" &&
                user?.role_override !== "super-admin" &&
                user?.roles?.every((r: any) => r.name !== "super-admin") && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    ⚠️ Gunakan "Override Role" untuk ERP users agar tracked di
                    audit log
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_active: value === "active" })
                }
              >
                <SelectTrigger id="is_active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
