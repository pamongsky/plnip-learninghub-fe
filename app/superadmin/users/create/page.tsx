"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CreateUserPage() {
  const router = useRouter();
  const { toast, showToast, clearToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employee_id: "",
    department: "",
    position: "",
    role: "user",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.role) {
      showToast({
        type: "error",
        message: "Nama, email, dan role harus diisi",
      });
      return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      showToast({
        type: "error",
        message: "Password tidak cocok",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/superadmin/users", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        employee_id: formData.employee_id || null,
        department: formData.department || null,
        position: formData.position || null,
        role: formData.role,
        password: formData.password || null,
      });

      showToast({
        type: "success",
        message: "User berhasil dibuat!",
      });

      setTimeout(() => {
        router.push("/superadmin/users");
      }, 2000);
    } catch (error: any) {
      console.error("Error creating user:", error);
      showToast({
        type: "error",
        message: error.response?.data?.message || "Gagal membuat user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast {...toast} onClose={clearToast} />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Tambah User Manual
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Buat user baru untuk fase development
            </p>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          variants={itemVariants}
          className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3 dark:bg-blue-900/20 dark:border-blue-800"
        >
          <div className="flex-shrink-0 mt-0.5">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
              User Manual (Development Phase)
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              User yang dibuat manual akan ditandai dengan source "Manual". Role dapat diubah kapan saja. Di production, user akan disinkronisasi dari ERP.
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Informasi User</CardTitle>
              <CardDescription>
                Isi data user yang akan dibuat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nama & Email */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Contoh: Ahmad Fauzi"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ahmad.fauzi@plnip.co.id"
                      required
                    />
                  </div>
                </div>

                {/* Employee ID & Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Employee ID
                    </label>
                    <Input
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      placeholder="PLN-2024-001 (opsional)"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      No. Telepon
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                </div>

                {/* Department & Position */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Unit/Departemen
                    </label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, department: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih unit..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pusat">Pusat</SelectItem>
                        <SelectItem value="Pembangkitan">Pembangkitan</SelectItem>
                        <SelectItem value="Transmisi">Transmisi</SelectItem>
                        <SelectItem value="Distribusi">Distribusi</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Posisi/Jabatan
                    </label>
                    <Input
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="Contoh: Engineer"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super-admin">
                        Super Admin (Full Access)
                      </SelectItem>
                      <SelectItem value="admin">
                        Admin (Unit Tertentu)
                      </SelectItem>
                      <SelectItem value="instructor">
                        Instructor (Pembuat Kelas)
                      </SelectItem>
                      <SelectItem value="user">User (Peserta Belajar)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">
                    Role menentukan hak akses user terhadap fitur platform
                  </p>
                </div>

                {/* Password */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password (opsional)
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        Password
                      </label>
                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Kosongkan untuk generate otomatis"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5">
                        Konfirmasi Password
                      </label>
                      <Input
                        name="password_confirmation"
                        type="password"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="Ulangi password"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Minimal 8 karakter. Jika kosong, sistem akan generate password otomatis.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-pln-primary to-pln-light"
                    disabled={loading}
                  >
                    {loading ? "Menyimpan..." : "Buat User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}
