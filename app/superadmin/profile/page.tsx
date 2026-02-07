"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  UserCircleIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  PencilSquareIcon,
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  PhoneIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

export default function SuperAdminProfilePage() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        position: user.position || "",
      });
    }
  }, [user]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA";

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Nama dan Email wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put("/profile", formData);
      if (response.data.success) {
        // Update user in context
        // Merge permissions/roles from old user object since API might not return them in the strict structure or we want to keep them
        setUser({ ...user, ...response.data.data.user } as any);
        toast.success("Profil berhasil diperbarui");
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.current_password ||
      !passwordData.password ||
      !passwordData.password_confirmation
    ) {
      toast.error("Semua kolom password wajib diisi");
      return;
    }

    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.put("/profile/password", passwordData);
      if (response.data.success) {
        toast.success("Password berhasil diubah");
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah password");
    } finally {
      setIsLoading(false);
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Super Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Profil Saya
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Kelola informasi akun Anda
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-3xl font-bold text-white shadow-lg shadow-pln-primary/30">
                    {initials}
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    {user?.name || "Super Admin"}
                  </h2>
                  <p className="text-slate-500">{user?.email}</p>
                  <div className="mt-3 flex gap-2 justify-center flex-wrap">
                    {user?.roles?.map((role) => (
                      <Badge
                        key={role}
                        className="bg-pln-100 text-pln-700 hover:bg-pln-100 uppercase text-[10px]"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-6 w-full border-t border-slate-200 pt-6 dark:border-slate-700">
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <BuildingOfficeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Departemen</p>
                          <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                            {user?.department || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <IdentificationIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Employee ID</p>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {user?.employee_id || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <ShieldCheckIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Status</p>
                          <p
                            className={`font-medium ${user?.is_active ? "text-green-600" : "text-red-600"}`}
                          >
                            {user?.is_active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Info */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Informasi Personal</CardTitle>
                  <CardDescription>Update data diri Anda</CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilSquareIcon className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form
                        if (user) {
                          setFormData({
                            name: user.name || "",
                            email: user.email || "",
                            phone: user.phone || "",
                            department: user.department || "",
                            position: user.position || "",
                          });
                        }
                      }}
                      disabled={isLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleUpdateProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nama Lengkap
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <UserCircleIcon className="h-5 w-5 text-slate-400" />
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                      <Input
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={!isEditing} // Email usually should be editable but careful
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No. Telepon
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-slate-400" />
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={!isEditing}
                        className="flex-1"
                        placeholder="0812..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Posisi / Jabatan
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <BriefcaseIcon className="h-5 w-5 text-slate-400" />
                      <Input
                        value={formData.position}
                        onChange={(e) =>
                          setFormData({ ...formData, position: e.target.value })
                        }
                        disabled={!isEditing}
                        className="flex-1"
                        placeholder="Staff..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Keamanan</CardTitle>
                <CardDescription>
                  Kelola password dan keamanan akun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password Saat Ini
                      </label>
                      <Input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        className="mt-1.5"
                        placeholder="******"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password Baru
                      </label>
                      <Input
                        type="password"
                        value={passwordData.password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            password: e.target.value,
                          })
                        }
                        className="mt-1.5"
                        placeholder="Minimal 8 karakter"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Konfirmasi Password Baru
                      </label>
                      <Input
                        type="password"
                        value={passwordData.password_confirmation}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            password_confirmation: e.target.value,
                          })
                        }
                        className="mt-1.5"
                        placeholder="Ulangi password baru"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      variant="destructive"
                      size="sm"
                    >
                      {isLoading ? "Memproses..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications (Dummy for now, or keep toggleable local state) */}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
