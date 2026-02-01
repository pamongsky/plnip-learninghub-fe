"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/axios";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  PencilSquareIcon,
  CameraIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function InstructorProfilePage() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [deviceLabel, setDeviceLabel] = useState("Perangkat ini");
  const [fullName, setFullName] = useState("");

  const profileData = {
    fullName: user?.name || "Instruktur",
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
    setPhone(user?.phone || "");
    setFullName(user?.name || "");
  }, [user?.phone, user?.name]);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      if (/windows/i.test(ua)) setDeviceLabel("Chrome di Windows");
      else if (/mac/i.test(ua)) setDeviceLabel("Safari di macOS");
      else if (/android/i.test(ua)) setDeviceLabel("Android Device");
      else if (/iphone|ipad/i.test(ua)) setDeviceLabel("iOS Device");
    }
  }, []);

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
        setUser({ ...user, ...response.data.data.user });
      } else if (response.data?.data?.avatar) {
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
      setStatusMessage("Password berhasil diubah.");
    } catch (error: any) {
      setStatusType("error");
      setStatusMessage(
        error.response?.data?.message || "Gagal mengubah password.",
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
          Profil Instruktur
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola informasi profil dan pengaturan akun instruktur
        </p>
      </motion.div>

      {/* Status Message - Above Tabs */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex items-center gap-3 p-4 rounded-lg ${
            statusType === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
              : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
          }`}
        >
          <CheckCircleIcon
            className={`w-5 h-5 flex-shrink-0 ${
              statusType === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          />
          <p
            className={`text-sm font-medium ${
              statusType === "success"
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {statusMessage}
          </p>
          <button onClick={() => setStatusMessage(null)} className="ml-auto">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </motion.div>
      )}

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
                id="instructor-grid"
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
              <rect width="100" height="100" fill="url(#instructor-grid)" />
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
              <img
                src={
                  profileData.avatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                }
                alt={profileData.fullName}
                className="w-24 h-24 rounded-xl border-4 border-white dark:border-slate-800 shadow-lg object-cover"
              />
              <button
                onClick={handleAvatarClick}
                disabled={avatarUploading}
                className="absolute bottom-1 right-1 w-7 h-7 bg-pln-primary text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-pln-dark transition-all disabled:opacity-50"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
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
              </div>
            </div>
            <motion.button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-pln-primary text-white rounded-lg text-xs font-medium hover:bg-pln-dark transition-all disabled:opacity-50"
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
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
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
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    Unit kerja berasal dari database
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <MapPinIcon className="w-3 h-3 inline mr-1" />
                    Posisi
                  </label>
                  <input
                    type="text"
                    defaultValue={profileData.position}
                    disabled
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                  />
                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    Posisi berasal dari database
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
              className="space-y-6"
            >
              {/* Change Password */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-slate-800 dark:text-white">
                  Ubah Password
                </h4>
                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password Saat Ini
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary"
                  />
                </motion.div>
                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary"
                  />
                </motion.div>
                <motion.div whileHover={{ y: -2 }}>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary"
                  />
                </motion.div>
                <motion.button
                  onClick={handleChangePassword}
                  disabled={
                    passwordLoading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-pln-primary text-white text-xs font-medium rounded-lg hover:bg-pln-dark transition-all disabled:opacity-50"
                >
                  <KeyIcon className="w-4 h-4 inline mr-2" />
                  {passwordLoading ? "Memproses..." : "Ubah Password"}
                </motion.button>
              </div>

              {/* Active Sessions */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-medium text-sm text-slate-800 dark:text-white mb-4">
                  Sesi Aktif
                </h4>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                        <UserCircleIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-slate-800 dark:text-white">
                          {deviceLabel}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Sesi saat ini
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                      Aktif
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === "preferences" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="space-y-4"
            >
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
                        Pilih bahasa aplikasi
                      </p>
                    </div>
                  </div>
                  <select className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary">
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
