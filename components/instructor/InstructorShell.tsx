"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  LifebuoyIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

// Navigation items - cleaner structure
const navItems = [
  {
    href: "/instructor",
    label: "Dashboard",
    icon: HomeIcon,
    exact: true,
  },
  {
    href: "/instructor/classes",
    label: "Kelas Saya",
    icon: AcademicCapIcon,
  },
  {
    href: "/instructor/announcements",
    label: "Pengumuman",
    icon: MegaphoneIcon,
  },
  {
    href: "/instructor/support",
    label: "Bantuan",
    icon: LifebuoyIcon,
  },
  {
    href: "/instructor/profile",
    label: "Profil Saya",
    icon: UserCircleIcon,
  },
];

export default function InstructorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "IN";

  useEffect(() => {
    // Set current date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("id-ID", options));

    // Theme handling
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    ).matches;
    const nextIsDark = storedTheme ? storedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    setIsDark(nextIsDark);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleMoodleAccess = async () => {
    try {
      const response = await api.post("/moodle/login-url");
      if (response.data?.success && response.data?.login_url) {
        window.open(response.data.login_url, "_blank");
      }
    } catch (error) {
      console.error("Failed to access Moodle:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/50 transition-all duration-300 ease-in-out dark:bg-slate-900/80 dark:border-slate-800/50 md:flex shadow-xl shadow-slate-200/20 dark:shadow-slate-950/50",
          isCollapsed ? "w-20" : "w-72",
        )}
      >
        {/* Logo Header */}
        <div className="relative">
          <div
            className={cn(
              "flex items-center gap-3 p-5 border-b border-slate-200/50 dark:border-slate-800/50",
              isCollapsed && "justify-center px-3",
            )}
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pln-primary via-pln-600 to-pln-light shadow-lg shadow-pln-primary/30"
            >
              <AcademicCapIcon className="h-6 w-6 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
            </motion.div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-pln-primary dark:text-pln-light">
                  PLN IP
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Instructor
                </span>
              </motion.div>
            )}
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all hover:scale-110"
          >
            <ChevronLeftIcon
              className={cn(
                "h-3 w-3 text-slate-600 dark:text-slate-400 transition-transform duration-300",
                isCollapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* User Card */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 border border-slate-200/50 dark:border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pln-primary to-pln-light text-white font-bold text-sm shadow-lg shadow-pln-primary/20">
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-800" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {user?.name || "Instructor"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || "instructor@plnip.local"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Menu Utama
            </p>
          )}
          <div className="space-y-1">
            {navItems.map((item, index) => {
              const active = isActive(item.href, item.exact);
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                      isCollapsed && "justify-center px-3",
                      active
                        ? "bg-gradient-to-r from-pln-primary to-pln-600 text-white shadow-lg shadow-pln-primary/30"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-200",
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-pln-primary group-hover:scale-110 dark:text-slate-500",
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {active && (
                          <ChevronRightIcon className="h-4 w-4 opacity-70" />
                        )}
                      </>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* Moodle Access Card */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-4"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pln-primary via-pln-600 to-pln-light p-4 text-white">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <AcademicCapIcon className="h-5 w-5" />
                  <span className="text-xs font-semibold opacity-90">
                    Learning Management
                  </span>
                </div>
                <p className="text-sm font-bold mb-3">Akses LMS Moodle</p>
                <Button
                  onClick={handleMoodleAccess}
                  size="sm"
                  className="w-full bg-white text-pln-primary hover:bg-white/90 font-semibold shadow-lg"
                >
                  Buka Moodle
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Section */}
        <div
          className={cn(
            "border-t border-slate-200/50 dark:border-slate-800/50 p-3",
            isCollapsed && "px-2",
          )}
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50",
              isCollapsed && "justify-center px-2",
            )}
          >
            {isDark ? (
              <SunIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-slate-500" />
            )}
            {!isCollapsed && (
              <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20",
              isCollapsed && "justify-center px-2",
            )}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header
        className={cn(
          "fixed top-0 right-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-72",
        )}
      >
        {/* Left - Mobile Menu & Date */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo for mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pln-primary to-pln-light">
              <AcademicCapIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">
              PLN IP
            </span>
          </div>

          {/* Date - desktop only */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {currentDate}
            </p>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle - mobile */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pln-primary to-pln-light text-white text-xs font-bold shadow-md">
                  {initials}
                </div>
                <ChevronRightIcon className="h-4 w-4 text-slate-400 rotate-90" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
              <DropdownMenuLabel className="font-normal px-2 py-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-pln-primary/10 text-pln-primary text-[10px] font-medium w-fit">
                    Instructor
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                <Link
                  href="/instructor/profile"
                  className="flex items-center gap-2"
                >
                  <UserCircleIcon className="h-4 w-4" />
                  Profil Saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                <Link
                  href="/instructor/support"
                  className="flex items-center gap-2"
                >
                  <LifebuoyIcon className="h-4 w-4" />
                  Bantuan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-lg"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-80 flex flex-col bg-white dark:bg-slate-900 md:hidden shadow-2xl"
          >
            {/* Logo */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pln-primary to-pln-light shadow-lg">
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-pln-primary">
                    PLN IP
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Instructor Portal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* User Card */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pln-primary to-pln-light text-white font-bold shadow-lg">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {user?.name || "Instructor"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instructor
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Menu Utama
              </p>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                        active
                          ? "bg-gradient-to-r from-pln-primary to-pln-600 text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                      )}
                    >
                      <item.icon
                        className={cn("h-5 w-5", active && "text-white")}
                      />
                      <span>{item.label}</span>
                      {active && (
                        <ChevronRightIcon className="h-4 w-4 ml-auto" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Moodle Button */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-pln-primary to-pln-light text-white">
                <p className="text-sm font-bold mb-2">Akses LMS Moodle</p>
                <Button
                  onClick={handleMoodleAccess}
                  size="sm"
                  className="w-full bg-white text-pln-primary hover:bg-white/90 font-semibold"
                >
                  Buka Moodle
                </Button>
              </div>
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Keluar dari Akun
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          isCollapsed ? "md:pl-20" : "md:pl-72",
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
