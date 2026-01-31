"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
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
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Mock profile data
  const profileData = {
    fullName: user?.name || "Muhammad Rizky",
    email: user?.email || "rizky@plnip.co.id",
    phone: "+62 812 3456 7890",
    nip: "19950315 202001 1 001",
    unit: "PLN IP - Unit Pembangkitan Suralaya",
    department: "Operasi Pembangkit",
    position: "Senior Engineer",
    location: "Banten, Indonesia",
    joinDate: "15 Maret 2020",
    bio: "Senior Engineer dengan pengalaman 5 tahun di bidang operasi pembangkit listrik tenaga uap.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: UserCircleIcon },
    { id: "security", label: "Keamanan", icon: ShieldCheckIcon },
    { id: "preferences", label: "Preferensi", icon: BellIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Profil Saya</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola informasi profil dan pengaturan akun</p>
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
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="profile-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#profile-grid)"/>
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
                src={profileData.avatar}
                alt={profileData.fullName}
                className="w-24 h-24 rounded-xl border-4 border-white dark:border-slate-800 shadow-lg object-cover"
              />
              <button className="absolute bottom-1 right-1 w-7 h-7 bg-pln-primary text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-pln-dark transition-all">
                <CameraIcon className="w-4 h-4" />
              </button>
            </motion.div>
            <div className="flex-1 pt-2 sm:pt-0">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{profileData.fullName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profileData.position}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  Terverifikasi
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">NIP: {profileData.nip}</span>
              </div>
            </div>
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-pln-primary text-white rounded-lg text-xs font-medium hover:bg-pln-dark transition-all"
            >
              <PencilSquareIcon className="w-4 h-4" />
              {isEditing ? "Simpan" : "Edit Profil"}
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
              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                <textarea
                  defaultValue={profileData.bio}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all resize-none"
                />
              </div>

              {/* Personal Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <EnvelopeIcon className="w-3 h-3 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={profileData.email}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                  />
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <PhoneIcon className="w-3 h-3 inline mr-1" />
                    Telepon
                  </label>
                  <input
                    type="tel"
                    defaultValue={profileData.phone}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                  />
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <BuildingOfficeIcon className="w-3 h-3 inline mr-1" />
                    Unit Kerja
                  </label>
                  <input
                    type="text"
                    defaultValue={profileData.unit}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                  />
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <MapPinIcon className="w-3 h-3 inline mr-1" />
                    Lokasi
                  </label>
                  <input
                    type="text"
                    defaultValue={profileData.location}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary disabled:bg-slate-50 dark:disabled:bg-slate-700/50 disabled:text-slate-500 dark:disabled:text-slate-400 transition-all"
                  />
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
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
                      <h4 className="font-medium text-sm text-slate-800 dark:text-white">Password</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Terakhir diubah 30 hari yang lalu</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-medium text-pln-primary dark:text-pln-light border border-pln-primary dark:border-pln-light rounded-lg hover:bg-pln-primary/5 dark:hover:bg-pln-light/10 transition-all">
                    Ubah Password
                  </button>
                </div>
              </motion.div>

              {/* Two Factor */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center shadow-sm">
                      <ShieldCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-slate-800 dark:text-white">Autentikasi Dua Faktor</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tambahkan keamanan ekstra untuk akun Anda</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded">Aktif</span>
                </div>
              </motion.div>

              {/* Active Sessions */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <h4 className="font-medium text-sm text-slate-800 dark:text-white mb-3">Sesi Aktif</h4>
                <div className="space-y-3">
                  {[
                    { device: "Chrome di Windows", location: "Jakarta, Indonesia", current: true },
                    { device: "Safari di iPhone", location: "Tangerang, Indonesia", current: false },
                  ].map((session, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-600 rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-slate-700 dark:text-white">{session.device}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{session.location}</p>
                      </div>
                      {session.current ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Sesi Ini</span>
                      ) : (
                        <button className="text-[10px] text-red-600 dark:text-red-400 font-medium hover:underline">Keluar</button>
                      )}
                    </motion.div>
                  ))}
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
                <h4 className="font-medium text-sm text-slate-800 dark:text-white mb-3">Notifikasi</h4>
                <div className="space-y-3">
                  {[
                    { label: "Email Kursus Baru", description: "Notifikasi saat ada kursus baru", enabled: true },
                    { label: "Email Pengingat", description: "Pengingat untuk melanjutkan pembelajaran", enabled: true },
                    { label: "Push Notification", description: "Notifikasi di browser", enabled: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-700 dark:text-white">{pref.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{pref.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={pref.enabled} className="sr-only peer" />
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
                      <h4 className="font-medium text-sm text-slate-800 dark:text-white">Bahasa</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Pilih bahasa tampilan</p>
                    </div>
                  </div>
                  <select className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-pln-primary/20">
                    <option>Bahasa Indonesia</option>
                    <option>English</option>
                  </select>
                </div>
              </motion.div>

              {/* Danger Zone */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <h4 className="font-medium text-sm text-red-800 dark:text-red-400">Zona Berbahaya</h4>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">Hapus akun Anda secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
                <button className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                  Hapus Akun
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
