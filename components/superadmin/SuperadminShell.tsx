"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  UsersIcon,
  MegaphoneIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  UserGroupIcon,
  PaintBrushIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { BellIcon } from "@heroicons/react/24/solid";
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

const navItems = [
  { href: "/superadmin", label: "Dashboard", icon: ChartBarIcon },
  { href: "/superadmin/users", label: "Kelola User", icon: UsersIcon },
  {
    href: "/superadmin/roles",
    label: "Roles & Permissions",
    icon: ShieldCheckIcon,
  },
  {
    href: "/superadmin/announcements",
    label: "Pengumuman Global",
    icon: MegaphoneIcon,
  },
  {
    href: "/superadmin/ai-faqs",
    label: "AI FAQ Assistant",
    icon: SparklesIcon,
  },
  {
    href: "/superadmin/escalations",
    label: "Tiket Eskalasi",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    href: "/superadmin/home",
    label: "Home CMS",
    icon: BuildingOffice2Icon,
  },
  {
    href: "/superadmin/partners",
    label: "Partner Institusi",
    icon: UserGroupIcon,
  },
  {
    href: "/superadmin/leaders",
    label: "Struktur Pimpinan",
    icon: UsersIcon,
  },
  { href: "/superadmin/moodle", label: "Moodle Sync", icon: ArrowPathIcon },
  { href: "/superadmin/settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function SuperadminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "SA";

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white px-5 py-6 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 md:flex",
          isCollapsed ? "w-20 px-3" : "w-64",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          {!isCollapsed && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Super Admin
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                PLN IP Hub
              </p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-6 flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Navigation */}
        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/superadmin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isCollapsed && "justify-center px-3",
                  isActive
                    ? "bg-gradient-to-r from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive && "text-rose-500",
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle & User */}
        <div className={cn("mt-auto space-y-4", isCollapsed && "items-center")}>
          <button
            onClick={toggleTheme}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
              isCollapsed && "justify-center px-3",
            )}
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            {!isCollapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
                  isCollapsed && "justify-center px-3",
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-sm font-semibold text-white">
                  {initials}
                </span>
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user?.name || "Super Admin"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Super Admin
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/superadmin/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/superadmin/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white">
            <ShieldCheckIcon className="h-5 w-5" />
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">
            Super Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isMobileMenuOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-950 md:hidden flex"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg">
            <ShieldCheckIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Super Admin
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">
              PLN IP Hub
            </p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/superadmin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive && "text-rose-500",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300 md:pt-0",
          isCollapsed ? "md:pl-20" : "md:pl-64",
        )}
      >
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
