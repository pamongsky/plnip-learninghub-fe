"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { getEcho } from "@/lib/echo";
import AIChatWidget from "@/components/AIChatWidget";
import {
  HomeIcon,
  BookOpenIcon,
  TrophyIcon,
  MegaphoneIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  AcademicCapIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  LifebuoyIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    description: "Ringkasan pembelajaran",
  },
  {
    name: "Kelas Saya",
    href: "/dashboard/classes",
    icon: AcademicCapIcon,
    description: "Kelas yang diikuti",
  },
  {
    name: "Sertifikat",
    href: "/dashboard/certificates",
    icon: TrophyIcon,
    description: "Sertifikat yang diperoleh",
  },
  {
    name: "Pengumuman",
    href: "/dashboard/announcements",
    icon: MegaphoneIcon,
    description: "Info & pengumuman",
  },
  {
    name: "Bantuan",
    href: "/dashboard/support",
    icon: LifebuoyIcon,
    description: "Butuh bantuan?",
  },
  {
    name: "Profil Saya",
    href: "/dashboard/profile",
    icon: UserCircleIcon,
    description: "Kelola profil",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
  const [isMobile, setIsMobile] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: number;
      title: string;
      message: string;
      time: string;
      read: boolean;
      type: string;
    }>
  >([
    {
      id: 1,
      title: "Kursus Baru Tersedia",
      message: "Kursus Keselamatan Kerja K3 telah ditambahkan",
      time: "5 menit lalu",
      read: false,
      type: "course",
    },
    {
      id: 2,
      title: "Sertifikat Diterbitkan",
      message: "Sertifikat Dasar Pembangkit Listrik siap diunduh",
      time: "1 jam lalu",
      read: false,
      type: "certificate",
    },
    {
      id: 3,
      title: "Pengumuman Penting",
      message: "Townhall Meeting Q1 2026 akan dilaksanakan",
      time: "2 jam lalu",
      read: true,
      type: "announcement",
    },
    {
      id: 4,
      title: "Reminder",
      message: "Selesaikan kursus sebelum deadline",
      time: "1 hari lalu",
      read: true,
      type: "reminder",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const firstName = user?.name?.split(" ")[0] || "User";
  const avatarUrl = user?.avatar || null;

  // Detect mobile/desktop and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On first load or resize, adjust sidebar
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`users.${user.id}.notifications`);

    // Listen for new notifications
    channel.listen("NotificationEvent", (data: any) => {
      const newNotification = {
        id: Date.now(),
        title: data.title || "Notifikasi Baru",
        message: data.message || "",
        time: "Baru saja",
        read: false,
        type: data.type || "announcement",
      };

      // Add new notification to the beginning
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      echo.leaveChannel(`users.${user.id}.notifications`);
    };
  }, [user?.id]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-all duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-pln-primary to-pln-light rounded-xl flex items-center justify-center shadow-lg shadow-pln-primary/20 group-hover:shadow-xl group-hover:shadow-pln-primary/30 transition-all">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 dark:text-white">
                  PLN IP
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Learning Hub
                </p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Tutup Sidebar"
            >
              <ChevronDoubleLeftIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* User Quick Info */}
          <div className="p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-700/50">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-white/60 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white font-semibold text-sm">
                  {firstName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-white text-sm truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Learner
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                    active
                      ? "bg-pln-primary text-white shadow-lg shadow-pln-primary/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${active ? "" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white"}`}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  {active && (
                    <ChevronRightIcon className="w-4 h-4 opacity-70" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-72" : "lg:ml-0"}`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80 transition-colors duration-300">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${sidebarOpen ? "hidden" : ""}`}
                title="Buka Sidebar"
              >
                <ChevronDoubleRightIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </button>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Dark Mode Toggle with Animation */}
              <motion.button
                onClick={toggleDarkMode}
                className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors overflow-hidden"
                title={darkMode ? "Mode Terang" : "Mode Gelap"}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={darkMode ? "sun" : "moon"}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {darkMode ? (
                      <SunIcon className="w-5 h-5 text-amber-400" />
                    ) : (
                      <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    )}
                  </motion.div>
                </AnimatePresence>
                {/* Sparkle effect on toggle */}
                {darkMode && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-amber-400/20 rounded-full"
                  />
                )}
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <BellIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {notificationOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setNotificationOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                          <h3 className="font-semibold text-slate-800 dark:text-white">
                            Notifikasi
                          </h3>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                              {unreadCount} baru
                            </span>
                          )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <Link
                                key={notif.id}
                                href={
                                  notif.type === "announcement"
                                    ? "/dashboard/announcements"
                                    : notif.type === "certificate"
                                      ? "/dashboard/certificates"
                                      : notif.type === "course"
                                        ? "/dashboard/classes"
                                        : "/dashboard"
                                }
                                onClick={() => {
                                  setNotificationOpen(false);
                                  // Mark as read when clicked
                                  setNotifications((prev) =>
                                    prev.map((n) =>
                                      n.id === notif.id
                                        ? { ...n, read: true }
                                        : n,
                                    ),
                                  );
                                }}
                                className={`block p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                                  !notif.read
                                    ? "bg-blue-50/50 dark:bg-blue-500/10"
                                    : ""
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      notif.type === "course"
                                        ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                        : notif.type === "certificate"
                                          ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                                          : notif.type === "announcement"
                                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                            : "bg-slate-100 dark:bg-slate-600/20 text-slate-600 dark:text-slate-400"
                                    }`}
                                  >
                                    {notif.type === "course" && (
                                      <BookOpenIcon className="w-4 h-4" />
                                    )}
                                    {notif.type === "certificate" && (
                                      <TrophyIcon className="w-4 h-4" />
                                    )}
                                    {notif.type === "announcement" && (
                                      <MegaphoneIcon className="w-4 h-4" />
                                    )}
                                    {notif.type === "reminder" && (
                                      <BellIcon className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm ${!notif.read ? "font-semibold text-slate-800 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}
                                    >
                                      {notif.title}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                      {notif.message}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                      {notif.time}
                                    </p>
                                  </div>
                                  {!notif.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                  )}
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <BellIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                              <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Tidak ada notifikasi
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                          <Link
                            href="/dashboard/announcements"
                            onClick={() => setNotificationOpen(false)}
                            className="block text-center text-sm text-pln-primary dark:text-pln-light hover:text-pln-primary/80 dark:hover:text-pln-light/80 font-medium"
                          >
                            Lihat Semua Notifikasi
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || "User"}
                      className="w-8 h-8 rounded-full object-cover border border-white/60 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white font-semibold text-sm">
                      {firstName.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
                    {firstName}
                  </span>
                  <ChevronRightIcon
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileDropdownOpen(false)}
                      />

                      {/* Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={user?.name || "User"}
                                className="w-12 h-12 rounded-full object-cover border border-white/60 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white font-bold text-lg">
                                {firstName.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-white truncate">
                                {user?.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                          >
                            <UserCircleIcon className="w-5 h-5 text-slate-400" />
                            <span className="font-medium text-sm">
                              Profil Saya
                            </span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              logout();
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span className="font-medium text-sm">Keluar</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
