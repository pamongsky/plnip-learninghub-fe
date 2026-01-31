"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AcademicCapIcon,
  ChartBarIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  LifebuoyIcon,
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
  { href: "/instructor", label: "Dashboard", icon: ChartBarIcon },
  { href: "/instructor/classes", label: "Kelas", icon: AcademicCapIcon },
  { href: "/instructor/announcements", label: "Announcements", icon: BellIcon },
  {
    href: "/instructor/support",
    label: "Bantuan",
    icon: LifebuoyIcon,
  },
  { href: "/instructor/profile", label: "Profile", icon: UserCircleIcon },
];

export default function InstructorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const moodleUrl = process.env.NEXT_PUBLIC_MOODLE_URL || "";
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "IN";

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
    <div className="min-h-screen bg-slate-50 font-instructor dark:bg-slate-950">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-950 md:flex",
          isCollapsed ? "w-20 px-3" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pln-primary text-white">
            <AcademicCapIcon className="h-6 w-6" />
          </span>
          {!isCollapsed && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Instructor
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Learning Hub
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Menu
          </div>
        )}
        <nav className="mt-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border border-pln-50 bg-pln-50 text-pln-primary dark:border-pln-50/20 dark:bg-pln-primary/10"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    active
                      ? "bg-white text-pln-primary dark:bg-slate-950"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Next sync with Moodle
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Today, 14:30
            </p>
            <Button
              variant="secondary"
              className="mt-3 w-full justify-center text-xs"
              size="sm"
            >
              Refresh status
            </Button>
          </div>
        )}
      </aside>

      <div
        className={cn(
          "flex min-h-screen flex-col",
          isCollapsed ? "md:ml-20" : "md:ml-64",
        )}
      >
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:px-8">
          <div className="flex flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800"
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <SunIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
              ) : (
                <MoonIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
              )}
            </Button>
            {moodleUrl ? (
              <Button
                asChild
                size="sm"
                className="bg-pln-primary text-white hover:bg-pln-dark"
              >
                <Link href={moodleUrl} target="_blank" rel="noreferrer">
                  Masuk Moodle
                </Link>
              </Button>
            ) : (
              <Button size="sm" disabled className="bg-pln-primary text-white">
                Masuk Moodle
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pln-primary text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className="hidden text-sm font-semibold sm:inline">
                    {user?.name || "Instructor"}
                  </span>
                  <UserCircleIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
                <DropdownMenuLabel className="space-y-1 rounded-xl bg-slate-50 p-3 text-left dark:bg-slate-900">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || "Instructor"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || "instructor@plnip.local"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
                  <Link
                    href="/instructor/profile"
                    className="flex items-center gap-2"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Edit profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2">
                  <a
                    href="mailto:hcis@plnip.co.id"
                    className="flex items-center gap-2"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold">
                      i
                    </span>
                    Support
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-xl px-3 py-2 text-rose-500 focus:text-rose-600"
                  onClick={logout}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
