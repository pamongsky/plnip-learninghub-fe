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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employee_id: "",
    department: "",
    position: "",
    role: "learner",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate & show per-field errors
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Nama lengkap wajib diisi";
    if (!formData.email.trim()) errors.email = "Email wajib diisi";
    if (!formData.role) errors.role = "Role wajib dipilih";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast({
        type: "error",
        message: "Harap lengkapi field yang wajib diisi",
      });
      return;
    }

    setFieldErrors({});

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
      });

      // Download PDF with user credentials
      if (response.data.pdf) {
        const base64ToBlob = (base64: string, type: string) => {
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          return new Blob([byteArray], { type });
        };

        const pdfBlob = base64ToBlob(response.data.pdf, "application/pdf");
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `user-credential-${formData.email}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      showToast({
        type: "success",
        message: "User berhasil dibuat! PDF credentials telah didownload.",
      });

      setTimeout(() => {
        router.push("/superadmin/users");
      }, 2000);
    } catch (error) {
      const err = error as any;
      showToast({
        type: "error",
        message: err?.response?.data?.message || "Gagal membuat user",
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
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl truncate">
                Tambah User Manual
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400 truncate">
                Buat user baru untuk fase development
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/superadmin/users/create-bulk")}
            className="px-4 py-2 bg-gradient-to-r from-pln-primary to-pln-light hover:shadow-lg text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Buat Banyak User
          </button>
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
              User yang dibuat manual akan ditandai dengan source "Manual". Role
              dapat diubah kapan saja. Di production, user akan disinkronisasi
              dari ERP.
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Informasi User</CardTitle>
              <CardDescription>Isi data user yang akan dibuat</CardDescription>
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
                      onChange={(e) => {
                        handleChange(e);
                        setFieldErrors((p) => ({ ...p, name: "" }));
                      }}
                      placeholder="Contoh: Ahmad Fauzi"
                      required
                      className={fieldErrors.name ? "border-red-500" : ""}
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        handleChange(e);
                        setFieldErrors((p) => ({ ...p, email: "" }));
                      }}
                      placeholder="ahmad.fauzi@plnip.co.id"
                      required
                      className={fieldErrors.email ? "border-red-500" : ""}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Employee ID & Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium block mb-2">
                     NIP
                    </label>
                    <Input
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      placeholder="Contoh:12348"
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
                      Divisi
                    </label>
                    <Input
                      name="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      placeholder="Contoh: Divisi Keuangan"
                    />
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
                    onValueChange={(v) => {
                      handleRoleChange(v);
                      setFieldErrors((p) => ({ ...p, role: "" }));
                    }}
                  >
                    <SelectTrigger
                      className={fieldErrors.role ? "border-red-500" : ""}
                    >
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
                      <SelectItem value="learner">
                        Learner (Peserta Belajar)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.role && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.role}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Role menentukan hak akses user terhadap fitur platform
                  </p>
                </div>

                {/* Info - Password Auto-Generated */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ℹ️ <strong>Password otomatis:</strong> Sistem akan generate
                    password aman secara otomatis. Setelah user dibuat, PDF
                    berisi credentials akan otomatis terdownload.
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
