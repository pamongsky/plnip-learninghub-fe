"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  MegaphoneIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  LifebuoyIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
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

// Grouped navigation items for Instructor
const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/instructor", label: "Dashboard", icon: HomeIcon }],
  },
  {
    label: "Pembelajaran",
    items: [
      {
        href: "/instructor/classes",
        label: "Kelas Saya",
        icon: AcademicCapIcon,
      },
    ],
  },
  {
    label: "Informasi",
    items: [
      {
        href: "/instructor/announcements",
        label: "Pengumuman",
        icon: MegaphoneIcon,
      },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/instructor/support", label: "Bantuan", icon: LifebuoyIcon },
    ],
  },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navGroups.map((g) => g.label),
  );

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "IN";

  const avatarUrl = user?.avatar || null;

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

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    );
  };

  const isActive = (href: string) => {
    if (href === "/instructor") {
      return pathname === "/instructor";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200/80 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 md:flex",
          isCollapsed ? "w-[72px]" : "w-72",
        )}
      >
        {/* Logo Header */}
        <div
          className={cn(
            "flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 p-4",
            isCollapsed && "justify-center px-2",
          )}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pln-primary to-pln-light shadow-lg shadow-pln-primary/25">
            <AcademicCapIcon className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pln-light">
                Instructor
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                PLN IP Learning Hub
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-3">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 p-3 dark:from-slate-800 dark:to-slate-800/50">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || "User"}
                  className="h-10 w-10 rounded-lg object-cover border border-white/60 shadow-sm"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pln-primary to-pln-light text-sm font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instructor
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className={cn("px-3 py-2", isCollapsed && "px-2")}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
              isCollapsed && "px-2",
            )}
          >
            <Bars3Icon className="h-4 w-4" />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                >
                  <span>{group.label}</span>
                  <ChevronDownIcon
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      expandedGroups.includes(group.label) && "rotate-180",
                    )}
                  />
                </button>
              )}
              <AnimatePresence initial={false}>
                {(isCollapsed || expandedGroups.includes(group.label)) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            isCollapsed && "justify-center px-2",
                            active
                              ? "bg-gradient-to-r from-pln-primary to-pln-primary/90 text-white shadow-md shadow-pln-primary/25"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                              active
                                ? "text-white"
                                : "text-slate-400 group-hover:text-pln-primary dark:text-slate-500",
                            )}
                          />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pln-primary to-pln-light">
            <AcademicCapIcon className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">
            Instructor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
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
            className="fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden flex"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pln-primary to-pln-light shadow-lg">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pln-light">
                  Instructor
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  PLN IP Learning Hub
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3">
              {navGroups.map((group) => (
                <div key={group.label} className="mb-3">
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            active
                              ? "bg-gradient-to-r from-pln-primary to-pln-primary/90 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                          )}
                        >
                          <item.icon
                            className={cn("h-5 w-5", active && "text-white")}
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Profile Section */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-3">
              <Link
                href="/instructor/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <UserCircleIcon className="h-5 w-5" />
                <span>Profil Saya</span>
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Keluar
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      <header
        className={cn(
          "sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:flex",
          isCollapsed ? "md:ml-[72px]" : "md:ml-72",
        )}
      >
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <SunIcon className="h-5 w-5 text-amber-500" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || "User"}
                    className="h-8 w-8 rounded-lg object-cover border border-white/60 shadow-sm"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pln-primary to-pln-light text-xs font-bold text-white">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.name?.split(" ")[0] || "Instructor"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  href="/instructor/profile"
                  className="flex items-center gap-2"
                >
                  <UserCircleIcon className="h-4 w-4" />
                  Profil Saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300 md:pt-0",
          isCollapsed ? "md:pl-[72px]" : "md:pl-72",
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
