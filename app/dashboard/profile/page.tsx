"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PencilSquareIcon,
  CameraIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null,
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileData = {
    fullName: user?.name || "User",
    email: user?.email || "-",
    phone: user?.phone || "",
    unit: user?.department || "-",
    position: user?.position || "-",
    joinDate: user?.created_at
      ? new Date(user.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-",
    avatar: user?.avatar || null,
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: UserCircleIcon },
    { id: "security", label: "Keamanan", icon: ShieldCheckIcon },
    { id: "preferences", label: "Preferensi", icon: BellIcon },
  ];

  useEffect(() => {
    setPhone(profileData.phone || "");
    setFullName(user?.name || "");
  }, [profileData.phone, user?.name]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const response = await api.put("/profile", {
        name: fullName,
        email: user.email,
        phone,
        department: user.department,
        position: user.position,
      });

      if (response.data?.data?.user) {
        setUser({ ...user, ...response.data.data.user });
      }

      setIsEditing(false);
      setStatusType("success");
      setStatusMessage("Profil berhasil diperbarui.");
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(
        error.response?.data?.message || "Gagal memperbarui profil.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setAvatarUploading(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.data?.user) {
        // Update user dengan data baru dari response
        setUser({ ...user, ...response.data.data.user });
      } else if (response.data?.data?.avatar) {
        // Fallback jika format response berbeda
        setUser({ ...user, avatar: response.data.data.avatar });
      }

      setStatusType("success");
      setStatusMessage("Foto profil berhasil diperbarui.");
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(
        error.response?.data?.message || "Gagal mengunggah foto profil.",
      );
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    setStatusMessage(null);
    setStatusType(null);

    // Validasi frontend
    if (newPassword.length < 8) {
      setStatusType("error");
      setStatusMessage("Password minimal 8 karakter.");
      setPasswordLoading(false);
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setStatusType("error");
      setStatusMessage("Password harus mengandung huruf kecil.");
      setPasswordLoading(false);
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setStatusType("error");
      setStatusMessage("Password harus mengandung huruf besar.");
      setPasswordLoading(false);
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setStatusType("error");
      setStatusMessage("Password harus mengandung angka.");
      setPasswordLoading(false);
      return;
    }

    if (!/[@$!%*#?&]/.test(newPassword)) {
      setStatusType("error");
      setStatusMessage("Password harus mengandung karakter spesial (@$!%*#?&).");
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusType("error");
      setStatusMessage("Konfirmasi password tidak cocok.");
      setPasswordLoading(false);
      return;
    }

    try {
      await api.put("/profile/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatusType("success");
      setStatusMessage("Password berhasil diperbarui.");
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(
        error.response?.data?.message || "Gagal memperbarui password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Profil Saya
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola informasi profil dan pengaturan akun
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-pln-primary via-pln-light to-cyan-500 relative">
          <div className="absolute inset-0 opacity-20">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <pattern
                id="profile-grid"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 8 0 L 0 0 0 8"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
              <rect width="100" height="100" fill="url(#profile-grid)" />
            </svg>
          </div>
        </div>

        {/* Avatar & Basic Info */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="group relative">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.fullName}
                    className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.fullName.charAt(0)}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute inset-0 rounded-2xl bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  title="Ubah foto profil"
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 text-slate-800 rounded-full text-xs font-semibold">
                    <CameraIcon className="w-4 h-4" />
                    Ubah Foto
                  </div>
                </button>
                {avatarUploading && (
                  <div className="absolute inset-0 rounded-2xl bg-slate-900/60 flex items-center justify-center text-white text-xs font-semibold">
                    Mengunggah...
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </motion.div>
            <div className="flex-1 pt-2 sm:pt-0">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {profileData.fullName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profileData.position}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  Terverifikasi
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Email terverifikasi
                </span>
              </div>
            </div>
            <motion.button
              onClick={() =>
                isEditing ? handleSaveProfile() : setIsEditing(true)
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-pln-primary text-white rounded-lg text-xs font-medium hover:bg-pln-dark transition-all disabled:opacity-70"
            >
              <PencilSquareIcon className="w-4 h-4" />
              {saving ? "Menyimpan..." : isEditing ? "Simpan" : "Edit Profil"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
      >
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-pln-primary text-pln-primary dark:text-pln-light"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {statusMessage && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                statusType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {statusMessage}
            </div>
          )}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="space-y-6"
            >
              {/* Personal Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <UserCircleIcon className="w-3 h-3 inline mr-1" />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <EnvelopeIcon className="w-3 h-3 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={profileData.email}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Email dikunci oleh sistem
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <PhoneIcon className="w-3 h-3 inline mr-1" />
                    Telepon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                    placeholder="Masukkan nomor telepon"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <BuildingOfficeIcon className="w-3 h-3 inline mr-1" />
                    Unit Kerja
                  </label>
                  <input
                    type="text"
                    defaultValue={profileData.unit}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Unit kerja berasal dari ITD
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <BuildingOfficeIcon className="w-3 h-3 inline mr-1" />
                    Posisi
                  </label>
                  <input
                    type="text"
                    defaultValue={profileData.position}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Posisi berasal dari ITD
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <CalendarIcon className="w-3 h-3 inline mr-1" />
                    Bergabung Sejak
                  </label>
                  <input
                    type="text"
                    defaultValue={profileData.joinDate}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="space-y-4"
            >
              {/* Password */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                      <KeyIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-slate-800 dark:text-white">
                        Password
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Min 8 karakter: huruf besar, kecil, angka, & simbol
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Password saat ini"
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password baru"
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi password"
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="px-4 py-2 text-xs font-medium text-white bg-pln-primary rounded-lg hover:bg-pln-dark transition-all disabled:opacity-70"
                  >
                    {passwordLoading ? "Menyimpan..." : "Ubah Password"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "preferences" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="space-y-4"
            >
              {/* Notifications */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <h4 className="font-medium text-sm text-slate-800 dark:text-white mb-3">
                  Notifikasi
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      label: "Email Kursus Baru",
                      description: "Notifikasi saat ada kursus baru",
                      enabled: true,
                    },
                    {
                      label: "Email Pengingat",
                      description: "Pengingat untuk melanjutkan pembelajaran",
                      enabled: true,
                    },
                    {
                      label: "Push Notification",
                      description: "Notifikasi di browser",
                      enabled: false,
                    },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-700 dark:text-white">
                          {pref.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {pref.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={pref.enabled}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 peer-focus:ring-2 peer-focus:ring-pln-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pln-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Language */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                      <GlobeAltIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-slate-800 dark:text-white">
                        Bahasa
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pilih bahasa tampilan
                      </p>
                    </div>
                  </div>
                  <select className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20">
                    <option>Bahasa Indonesia</option>
                    <option>English</option>
                  </select>
                </div>
              </motion.div>

              {/* Danger zone removed per product decision */}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
