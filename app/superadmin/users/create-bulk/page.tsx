"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/axios";

interface UserRow {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  phone: string;
  department: string;
  role: string;
}

export default function CreateBulkUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      email: "",
      employee_id: "",
      phone: "",
      department: "",
      role: "learner",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addRow = () => {
    setUsers([
      ...users,
      {
        id: crypto.randomUUID(),
        name: "",
        email: "",
        employee_id: "",
        phone: "",
        department: "",
        role: "learner",
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (users.length === 1) {
      setError("Minimal harus ada 1 user");
      return;
    }
    setUsers(users.filter((u) => u.id !== id));
  };

  const updateUser = (id: string, field: keyof UserRow, value: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    const filledUsers = users.filter((u) => u.name.trim() && u.email.trim());

    if (filledUsers.length === 0) {
      setError("Minimal harus ada 1 user dengan nama dan email diisi");
      return;
    }

    // Check for duplicate emails
    const emails = filledUsers.map((u) => u.email.toLowerCase());
    const duplicateEmails = emails.filter(
      (email, index) => emails.indexOf(email) !== index,
    );
    if (duplicateEmails.length > 0) {
      setError(`Email duplikat: ${duplicateEmails.join(", ")}`);
      return;
    }

    // Check for duplicate employee IDs
    const employeeIds = filledUsers
      .map((u) => u.employee_id)
      .filter((id) => id.trim());
    const duplicateIds = employeeIds.filter(
      (id, index) => employeeIds.indexOf(id) !== index,
    );
    if (duplicateIds.length > 0) {
      setError(`NIP duplikat: ${duplicateIds.join(", ")}`);
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/superadmin/users/bulk", {
        users: filledUsers.map((u) => ({
          name: u.name,
          email: u.email,
          employee_id: u.employee_id || null,
          phone: u.phone || null,
          department: u.department || null,
          role: u.role,
        })),
      });

      setSuccess(
        `${response.data.created_count} user berhasil dibuat! Download PDF untuk melihat passwords.`,
      );

      // Download PDF
      if (response.data.pdf) {
        const pdfBlob = base64ToBlob(response.data.pdf, "application/pdf");
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `user-credentials-bulk-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      // Show errors if any
      if (response.data.errors && response.data.errors.length > 0) {
        setError(
          "Beberapa user gagal dibuat:\n" + response.data.errors.join("\n"),
        );
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        router.push("/superadmin/users");
      }, 2000);
    } catch (err) {
      const error = err as any;
      setError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Gagal membuat users",
      );
    } finally {
      setLoading(false);
    }
  };

  const base64ToBlob = (base64: string, type: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/superadmin/users"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-pln-primary dark:hover:text-pln-light mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali ke Daftar User
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white flex-shrink-0">
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white truncate">
                Buat User Bulk
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                Buat banyak user sekaligus - password akan di-generate otomatis
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/superadmin/users/create")}
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Buat User Tunggal
          </button>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
      >
        <p className="text-sm text-blue-800 dark:text-blue-300">
          ℹ️ <strong>Info:</strong> Password akan di-generate otomatis untuk
          semua user. Setelah submit, akan otomatis download PDF berisi semua
          credentials user.
        </p>
      </motion.div>

      {/* Error/Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm whitespace-pre-line"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm"
        >
          {success}
        </motion.div>
      )}

      {/* Form Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  No
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Nama <span className="text-red-500">*</span>
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Email <span className="text-red-500">*</span>
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  NIP
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Phone
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Divisi
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Role <span className="text-red-500">*</span>
                </th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 dark:border-slate-700 last:border-0"
                >
                  <td className="px-2 sm:px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) =>
                        updateUser(user.id, "name", e.target.value)
                      }
                      className="w-full px-2 sm:px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                      placeholder="Nama lengkap"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) =>
                        updateUser(user.id, "email", e.target.value)
                      }
                      className="w-full px-2 sm:px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                      placeholder="email@plnip.co.id"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <input
                      type="text"
                      value={user.employee_id}
                      onChange={(e) =>
                        updateUser(user.id, "employee_id", e.target.value)
                      }
                      className="w-full px-2 sm:px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                      placeholder="123456"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <input
                      type="text"
                      value={user.phone}
                      onChange={(e) =>
                        updateUser(user.id, "phone", e.target.value)
                      }
                      className="w-full px-2 sm:px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                      placeholder="08123456789"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <input
                      type="text"
                      value={user.department}
                      onChange={(e) =>
                        updateUser(user.id, "department", e.target.value)
                      }
                      className="w-full px-2 sm:px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                      placeholder="IT"
                    />
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUser(user.id, "role", e.target.value)
                      }
                      className="w-full px-2 sm:px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                    >
                      <option value="learner">Learner</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                      <option value="super-admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      disabled={users.length === 1}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Baris
          </button>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end gap-3"
      >
        <Link
          href="/superadmin/users"
          className="px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
        >
          Batal
        </Link>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pln-primary to-pln-light hover:shadow-lg hover:shadow-pln-primary/30 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          {loading ? "Membuat..." : "Buat & Download PDF"}
        </button>
      </motion.div>
    </div>
  );
}
