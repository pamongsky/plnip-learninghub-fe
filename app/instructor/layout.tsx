"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getEcho } from "@/lib/echo";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  UserCircleIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowRightOnRectangleIcon,
  LifebuoyIcon,
  BookOpenIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  {
    name: "Dashboard",
    href: "/instructor",
    icon: HomeIcon,
    description: "Ringkasan kelas"
  },
  {
    name: "Kelas Saya",
    href: "/instructor/classes",
    icon: AcademicCapIcon,
    description: "Kelola kelas"
  },
  {
    name: "Pengumuman",
    href: "/instructor/announcements",
    icon: MegaphoneIcon,
    description: "Info & pengumuman"
  },
  {
    name: "Bantuan",
    href: "/instructor/support",
    icon: LifebuoyIcon,
    description: "Lapor kendala"
  },
  {
    name: "Profil Saya",
    href: "/instructor/profile",
    icon: UserCircleIcon,
    description: "Kelola profil"
  },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "Instructor";

  // Real notifications from WebSocket
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Kursus Baru Tersedia", message: "Kursus Keselamatan Kerja K3 tela...", time: "5 menit lalu", read: false, type: "course" },
    { id: 2, title: "Sertifikat Diterbitkan", message: "Sertifikat Dasar Pembangkit Listri...", time: "1 jam lalu", read: false, type: "certificate" },
    { id: 3, title: "Pengumuman Penting", message: "Townhall Meeting Q1 2026 akan dilak...", time: "2 jam lalu", read: true, type: "announcement" },
    { id: 4, title: "Reminder", message: "Selesaikan kursus sebelum deadline", time: "1 hari lalu", read: true, type: "reminder" },
  ]);

  // Mock notifications - will be replaced by real notifications from WebSocket
  const mockNotifications = [
    { id: 1, title: "Kursus Baru Tersedia", message: "Kursus Keselamatan Kerja K3 tela...", time: "5 menit lalu", read: false, type: "course" },
    { id: 2, title: "Sertifikat Diterbitkan", message: "Sertifikat Dasar Pembangkit Listri...", time: "1 jam lalu", read: false, type: "certificate" },
    { id: 3, title: "Pengumuman Penting", message: "Townhall Meeting Q1 2026 akan dilak...", time: "2 jam lalu", read: true, type: "announcement" },
    { id: 4, title: "Reminder", message: "Selesaikan kursus sebelum deadline", time: "1 hari lalu", read: true, type: "reminder" },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Real-time notifications via WebSocket
  useEffect(() => {
    if (!user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`users.${user.id}.notifications`);
    
    // Listen for new notifications
    channel.listen('NotificationEvent', (data: any) => {
      const newNotification = {
        id: Date.now(),
        title: data.title || "Notifikasi Baru",
        message: data.message || "",
        time: "Baru saja",
        read: false,
        type: data.type || "announcement"
      };
      
      // Add new notification to the beginning
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      echo.leaveChannel(`users.${user.id}.notifications`);
    };
  }, [user?.id]);

  const isActive = (href: string) => {
    if (href === "/instructor") {
      return pathname === "/instructor";
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
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
            <Link href="/instructor" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-pln-primary to-pln-light rounded-xl flex items-center justify-center shadow-lg shadow-pln-primary/20 group-hover:shadow-xl group-hover:shadow-pln-primary/30 transition-all">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 dark:text-white">PLN IP</h1>
                <p className="text-xs text-pln-primary dark:text-pln-light font-medium">Instructor</p>
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
              <img
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                }
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Instructor</p>
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
                  <item.icon className={`w-5 h-5 ${active ? "" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white"}`} />
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
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-72" : "lg:ml-0"}`}>
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
              {/* Dark Mode Toggle */}
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
                          <h3 className="font-semibold text-slate-800 dark:text-white">Notifikasi</h3>
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
                              <div
                                key={notif.id}
                                onClick={() => setNotificationOpen(false)}
                                className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                                  !notif.read ? "bg-blue-50/50 dark:bg-blue-500/10" : ""
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    notif.type === "course" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                                    notif.type === "certificate" ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" :
                                    notif.type === "announcement" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                                    "bg-slate-100 dark:bg-slate-600/20 text-slate-600 dark:text-slate-400"
                                  }`}>
                                    {notif.type === "course" && <BookOpenIcon className="w-4 h-4" />}
                                    {notif.type === "certificate" && <CheckCircleIcon className="w-4 h-4" />}
                                    {notif.type === "announcement" && <MegaphoneIcon className="w-4 h-4" />}
                                    {notif.type === "reminder" && <BellIcon className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${
                                      !notif.read ? "font-semibold text-slate-800 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"
                                    }`}>
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
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <BellIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                              <p className="text-slate-500 dark:text-slate-400 text-sm">Tidak ada notifikasi</p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                          <Link
                            href="#"
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
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <img
                    src={
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
                    }
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="font-medium text-slate-800 dark:text-white text-sm">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/instructor/profile"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                        >
                          <UserCircleIcon className="w-4 h-4" />
                          Profil Saya
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Keluar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
