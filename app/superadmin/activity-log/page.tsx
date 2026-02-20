"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "@/lib/axios";
import {
  ClockIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ActivityLog {
  id: number;
  user: { id: number; name: string; email: string };
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  changes: Record<string, unknown> | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface Stats {
  total_logs: number;
  unique_users: number;
  by_action: Record<string, { action: string; total: number }>;
}

interface ApiPaginatedResponse {
  success: boolean;
  data: ActivityLog[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTION_META: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  // Auth
  login: {
    label: "Login",
    color:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: "🔑",
  },
  logout: {
    label: "Logout",
    color:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-300",
    icon: "🚪",
  },
  password_changed: {
    label: "Ganti Password",
    color:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",
    icon: "🔒",
  },
  forgot_password_request: {
    label: "Lupa Password",
    color:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
    icon: "📧",
  },
  otp_verified: {
    label: "OTP Terverifikasi",
    color:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300",
    icon: "✅",
  },
  password_reset: {
    label: "Reset Password",
    color:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
    icon: "🔄",
  },
  // Course
  course_enrolled: {
    label: "Enroll Kelas",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    icon: "📚",
  },
  course_unenrolled: {
    label: "Unenroll Kelas",
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
    icon: "📤",
  },
  course_updated: {
    label: "Edit Kelas",
    color:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    icon: "✏️",
  },
  enrollment_role_changed: {
    label: "Ubah Role Kelas",
    color:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
    icon: "🎭",
  },
  // User management
  user_created: {
    label: "Buat User",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    icon: "👤",
  },
  user_updated: {
    label: "Edit User",
    color:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    icon: "✏️",
  },
  user_deleted: {
    label: "Hapus User",
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
    icon: "🗑️",
  },
  role_override: {
    label: "Override Role",
    color:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
    icon: "🛡️",
  },
  // Moodle
  akses_lms: {
    label: "Akses LMS",
    color:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300",
    icon: "🎓",
  },
  moodle_sso: {
    label: "Moodle SSO",
    color:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300",
    icon: "🔗",
  },
  // Generic fallback
  create: {
    label: "Buat",
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    icon: "➕",
  },
  update: {
    label: "Update",
    color:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    icon: "✏️",
  },
  delete: {
    label: "Hapus",
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300",
    icon: "🗑️",
  },
};

const getActionMeta = (action: string) =>
  ACTION_META[action] ?? {
    label: action,
    color:
      "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300",
    icon: "📌",
  };

const PERIODS = [
  { value: "1", label: "Hari Ini" },
  { value: "7", label: "7 Hari" },
  { value: "30", label: "30 Hari" },
  { value: "90", label: "90 Hari" },
  { value: "all", label: "Semua" },
];

const ACTION_FILTER_OPTIONS = [
  { value: "", label: "Semua Aksi" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "password_changed", label: "Ganti Password" },
  { value: "forgot_password_request", label: "Lupa Password" },
  { value: "otp_verified", label: "OTP Terverifikasi" },
  { value: "password_reset", label: "Reset Password" },
  { value: "course_enrolled", label: "Enroll Kelas" },
  { value: "course_unenrolled", label: "Unenroll Kelas" },
  { value: "course_updated", label: "Edit Kelas" },
  { value: "enrollment_role_changed", label: "Ubah Role Kelas" },
  { value: "user_created", label: "Buat User" },
  { value: "user_updated", label: "Edit User" },
  { value: "user_deleted", label: "Hapus User" },
  { value: "role_override", label: "Override Role" },
  { value: "akses_lms", label: "Akses LMS" },
  { value: "moodle_sso", label: "Moodle SSO" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    user_id: "",
    action: "",
    period: "all",
    search: "",
  });

  // Fetch users for dropdown
  useEffect(() => {
    axios
      .get("/users/all")
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : (r.data.data ?? []);
        setUsers(data);
      })
      .catch(() => setUsers([]));
  }, []);

  // Fetch stats when period changes
  useEffect(() => {
    axios
      .get("/activity-log/stats", { params: { period: filters.period } })
      .then((r) => setStats(r.data.data ?? null))
      .catch(() => setStats(null));
  }, [filters.period]);

  // Fetch logs
  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, per_page: 50 };
        if (filters.user_id) params.user_id = filters.user_id;
        if (filters.action) params.action = filters.action;
        if (filters.period !== "all") params.period = filters.period;
        if (filters.search) params.search = filters.search;

        const r = await axios.get<ApiPaginatedResponse>("/activity-log", {
          params,
        });
        const body = r.data;
        setLogs(body.data ?? []);
        setPagination({
          currentPage: body.pagination?.current_page ?? 1,
          lastPage: body.pagination?.last_page ?? 1,
          total: body.pagination?.total ?? 0,
        });
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchLogs(1);
  }, [filters, fetchLogs]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const groupByDate = (logs: ActivityLog[]) => {
    const map: Record<string, ActivityLog[]> = {};
    logs.forEach((log) => {
      const day = new Date(log.created_at).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      (map[day] ??= []).push(log);
    });
    return Object.entries(map).map(([date, logs]) => ({ date, logs }));
  };

  const toggleExpand = (id: number) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const resetFilters = () =>
    setFilters({ user_id: "", action: "", period: "all", search: "" });

  const grouped = groupByDate(logs);
  const hasActiveFilter = !!(
    filters.user_id ||
    filters.action ||
    filters.search
  );

  // ─── Quick stat cards (top 4 actions in current period) ───────────────────
  const topActions = stats
    ? Object.entries(stats.by_action)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 4)
    : [];

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
          Activity Log
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Riwayat lengkap aktivitas seluruh pengguna di sistem
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total logs */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </span>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total Log
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {stats?.total_logs?.toLocaleString() ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Unique users */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <UsersIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pengguna Aktif
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {stats?.unique_users?.toLocaleString() ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Top 2 action types */}
        {topActions.slice(0, 2).map(([action, { total }]) => {
          const meta = getActionMeta(action);
          return (
            <div
              key={action}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 text-xl">
                  {meta.icon}
                </span>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {meta.label}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-pln-primary" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Filter & Pencarian
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              placeholder="Cari nama, email, IP, reason..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* User */}
          <select
            value={filters.user_id}
            onChange={(e) =>
              setFilters((p) => ({ ...p, user_id: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="">Semua User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Action */}
          <select
            value={filters.action}
            onChange={(e) =>
              setFilters((p) => ({ ...p, action: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            {ACTION_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Period */}
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((p) => ({ ...p, period: e.target.value }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active filter chips + reset */}
        {hasActiveFilter && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            <span className="text-xs text-slate-500">Filter aktif:</span>
            {filters.user_id && (
              <span className="rounded bg-pln-primary px-2 py-0.5 text-xs text-white">
                User:{" "}
                {users.find((u) => u.id.toString() === filters.user_id)?.name ??
                  filters.user_id}
              </span>
            )}
            {filters.action && (
              <span className="rounded bg-pln-light px-2 py-0.5 text-xs text-white">
                Aksi:{" "}
                {
                  ACTION_FILTER_OPTIONS.find((a) => a.value === filters.action)
                    ?.label
                }
              </span>
            )}
            {filters.search && (
              <span className="rounded bg-purple-600 px-2 py-0.5 text-xs text-white">
                Cari: {filters.search}
              </span>
            )}
            <button
              onClick={resetFilters}
              className="ml-auto flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ArrowPathIcon className="h-3 w-3" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-pln-primary" />
            <p className="mt-3 text-sm text-slate-500">Memuat data...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ClockIcon className="h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Tidak ada aktivitas ditemukan
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Coba ubah filter atau periode waktu
            </p>
          </div>
        ) : (
          <>
            {/* Result count */}
            <div className="border-b border-slate-200 px-6 py-3 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {logs.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pagination.total}
                </span>{" "}
                log
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {grouped.map((group, gi) => (
                <div key={gi}>
                  {/* Date header */}
                  <div className="bg-slate-50 px-6 py-2.5 dark:bg-slate-700/30">
                    <p className="flex items-center gap-2 text-xs font-semibold text-pln-primary">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {group.date}
                      <span className="font-normal text-slate-400">
                        ({group.logs.length} aktivitas)
                      </span>
                    </p>
                  </div>

                  {/* Log entries */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {group.logs.map((log, li) => {
                        const meta = getActionMeta(log.action);
                        const time = new Date(
                          log.created_at,
                        ).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });
                        const expanded = expandedLogs.has(log.id);
                        const hasChanges =
                          log.changes && Object.keys(log.changes).length > 0;

                        return (
                          <div key={log.id} className="flex gap-4">
                            {/* Timeline connector */}
                            <div className="flex flex-col items-center">
                              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-pln-primary ring-4 ring-pln-primary/10" />
                              {li < group.logs.length - 1 && (
                                <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="mb-1 flex-1">
                              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 transition-colors hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-700/20 dark:hover:bg-slate-700/40">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 space-y-2">
                                    {/* Time + badge */}
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-mono text-xs font-bold text-pln-primary">
                                        {time}
                                      </span>
                                      <span
                                        className={`rounded border px-2 py-0.5 text-xs font-semibold ${meta.color}`}
                                      >
                                        {meta.label}
                                      </span>
                                    </div>

                                    {/* User */}
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-[10px] font-bold text-white">
                                        {log.user.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .slice(0, 2)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                          {log.user.name}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                          {log.user.email}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Reason */}
                                    {log.reason && (
                                      <p className="border-l-2 border-pln-light pl-2 text-xs text-slate-600 dark:text-slate-400">
                                        {log.reason}
                                      </p>
                                    )}

                                    {/* Meta chips */}
                                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                                      {log.ip_address && (
                                        <span>
                                          IP:{" "}
                                          <span className="font-mono text-slate-500 dark:text-slate-300">
                                            {log.ip_address}
                                          </span>
                                        </span>
                                      )}
                                      {log.entity_type && (
                                        <span>
                                          Entity:{" "}
                                          <span className="text-slate-500 dark:text-slate-300">
                                            {log.entity_type} #{log.entity_id}
                                          </span>
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Expand button */}
                                  {hasChanges && (
                                    <button
                                      onClick={() => toggleExpand(log.id)}
                                      className="flex flex-shrink-0 items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-pln-primary transition-colors hover:bg-pln-primary hover:text-white dark:border-slate-600"
                                    >
                                      {expanded ? (
                                        <>
                                          <ChevronUpIcon className="h-3 w-3" />{" "}
                                          Tutup
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDownIcon className="h-3 w-3" />{" "}
                                          Detail
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* Expanded JSON diff */}
                                {expanded && hasChanges && (
                                  <div className="mt-3 overflow-x-auto rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                                    <p className="mb-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                      Detail Perubahan:
                                    </p>
                                    <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                                      {JSON.stringify(log.changes, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
                <p className="text-xs text-slate-500">
                  Halaman {pagination.currentPage} dari {pagination.lastPage}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-400"
                  >
                    <ChevronLeftIcon className="h-3.5 w-3.5" /> Prev
                  </button>
                  <button
                    onClick={() => fetchLogs(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.lastPage}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-400"
                  >
                    Next <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
