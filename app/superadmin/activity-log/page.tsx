"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import {
  ClockIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: number;
  nip: string;
  name: string;
}

interface ActivityLog {
  id: number;
  user: {
    id: number;
    nip: string;
    name: string;
  };
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  changes: Record<string, any> | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface GroupedLogs {
  date: string;
  logs: ActivityLog[];
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    user_id: "",
    action: "",
    period: "7",
    search: "",
  });

  const actionTypes = [
    { value: "", label: "Semua Aksi" },
    { value: "login", label: "Login" },
    { value: "logout", label: "Logout" },
    { value: "akses_lms", label: "Akses LMS" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
  ];

  const periods = [
    { value: "1", label: "Hari Ini" },
    { value: "7", label: "7 Hari Terakhir" },
    { value: "30", label: "30 Hari Terakhir" },
    { value: "90", label: "90 Hari Terakhir" },
    { value: "all", label: "Semua Waktu" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users/all");
      // Handle both array response and object with data property
      const usersData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setUsers(usersData);
    } catch (error) {
      setUsers([]);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};

      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.action) params.action = filters.action;
      if (filters.period !== "all") params.period = filters.period;
      if (filters.search) params.search = filters.search;

      const response = await axios.get("/activity-log", { params });

      // If response is paginated
      if (response.data.data) {
        setLogs(response.data.data);
      } else {
        setLogs(response.data);
      }
    } catch (error) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const groupLogsByDate = (logs: ActivityLog[]): GroupedLogs[] => {
    const grouped: { [key: string]: ActivityLog[] } = {};

    logs.forEach((log) => {
      const date = new Date(log.created_at).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });

    return Object.entries(grouped).map(([date, logs]) => ({
      date,
      logs,
    }));
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      login: "bg-emerald-100 text-emerald-700 border-emerald-200",
      logout: "bg-slate-100 text-slate-700 border-slate-200",
      create: "bg-blue-100 text-blue-700 border-blue-200",
      update: "bg-amber-100 text-amber-700 border-amber-200",
      delete: "bg-red-100 text-red-700 border-red-200",
      akses_lms: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[action] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      login: "Login",
      logout: "Logout",
      create: "Buat",
      update: "Update",
      delete: "Hapus",
      akses_lms: "Akses LMS",
    };
    return labels[action] || action;
  };

  const toggleExpanded = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      user_id: "",
      action: "",
      period: "7",
      search: "",
    });
  };

  const groupedLogs = groupLogsByDate(logs);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-600 mt-1">
          Riwayat aktivitas pengguna di sistem
        </p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-[#035B71]" />
          <h2 className="font-semibold text-gray-900">Filter & Pencarian</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Nama, NIP, reason, IP..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#035B71]"
              />
            </div>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={filters.user_id}
              onChange={(e) => handleFilterChange("user_id", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#035B71]"
            >
              <option value="">Semua User</option>
              {Array.isArray(users) &&
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.nip})
                  </option>
                ))}
            </select>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Aksi
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#035B71]"
            >
              {actionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange("period", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#035B71]"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.user_id || filters.action || filters.search) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500">
                Filter Aktif:
              </span>
              {filters.user_id && (
                <span className="px-2 py-1 bg-[#035B71] text-white rounded text-xs">
                  User:{" "}
                  {Array.isArray(users) &&
                    users.find((u) => u.id.toString() === filters.user_id)
                      ?.name}
                </span>
              )}
              {filters.action && (
                <span className="px-2 py-1 bg-[#00A2B9] text-white rounded text-xs">
                  Aksi:{" "}
                  {actionTypes.find((a) => a.value === filters.action)?.label}
                </span>
              )}
              {filters.search && (
                <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">
                  Search: {filters.search}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#035B71]"></div>
            <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Tidak ada aktivitas ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">
              Coba ubah filter atau periode waktu
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {groupedLogs.map((group, groupIdx) => (
              <div key={groupIdx}>
                {/* Date Header */}
                <div className="bg-gradient-to-r from-[#035B71]/5 to-transparent px-6 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-[#035B71] flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    {group.date}
                    <span className="text-xs font-normal text-gray-500">
                      ({group.logs.length} aktivitas)
                    </span>
                  </p>
                </div>

                {/* Logs for this date */}
                <div className="p-6">
                  <div className="space-y-6">
                    {group.logs.map((log, logIdx) => {
                      const time = new Date(log.created_at).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        },
                      );
                      const isExpanded = expandedLogs.has(log.id);

                      return (
                        <div key={log.id} className="flex gap-4">
                          {/* Timeline dot and line */}
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-[#035B71] ring-4 ring-[#035B71]/10"></div>
                            {logIdx < group.logs.length - 1 && (
                              <div className="w-px flex-1 bg-gray-200 mt-1"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-2">
                            <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  {/* Time and Action */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-sm font-bold text-[#035B71]">
                                      {time}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs font-semibold border ${getActionColor(
                                        log.action,
                                      )}`}
                                    >
                                      {getActionLabel(log.action)}
                                    </span>
                                  </div>

                                  {/* User Info */}
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#035B71] to-[#00A2B9] text-xs font-bold text-white">
                                      {log.user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {log.user.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {log.user.nip}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Reason */}
                                  {log.reason && (
                                    <p className="text-sm text-gray-700 pl-3 border-l-2 border-[#00A2B9]">
                                      {log.reason}
                                    </p>
                                  )}

                                  {/* Meta Info */}
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                    {log.ip_address && (
                                      <span className="flex items-center gap-1">
                                        <span className="font-semibold">
                                          IP:
                                        </span>
                                        <span className="break-all">{log.ip_address}</span>
                                      </span>
                                    )}
                                    {log.entity_type && (
                                      <span className="flex items-center gap-1">
                                        <span className="font-semibold">
                                          Entity:
                                        </span>
                                        {log.entity_type} #{log.entity_id}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Expand button if has changes */}
                                {log.changes &&
                                  Object.keys(log.changes).length > 0 && (
                                    <button
                                      onClick={() => toggleExpanded(log.id)}
                                      className="text-xs text-[#035B71] hover:text-[#00A2B9] font-medium flex items-center gap-1 flex-shrink-0"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronUpIcon className="h-4 w-4" />
                                          Tutup
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDownIcon className="h-4 w-4" />
                                          Detail
                                        </>
                                      )}
                                    </button>
                                  )}
                              </div>

                              {/* Expanded changes */}
                              {isExpanded && log.changes && (
                                <div className="mt-3 p-3 bg-white rounded border border-gray-200 overflow-x-auto">
                                  <p className="text-xs font-semibold text-gray-700 mb-2">
                                    Perubahan Data:
                                  </p>
                                  <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
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
        )}
      </div>

      {/* Summary */}
      {logs.length > 0 && (
        <div className="bg-gradient-to-r from-[#035B71] to-[#00A2B9] rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Aktivitas</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
            <ClockIcon className="h-12 w-12 opacity-20" />
          </div>
        </div>
      )}
    </div>
  );
}
