"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  LifebuoyIcon,
  PlusIcon,
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  FunnelIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { supportApi, type SupportTicket } from "@/lib/api";

const categoryLabels: Record<string, { label: string; icon: string }> = {
  technical: { label: "Teknis Platform", icon: "🔧" },
  learning: { label: "Pembelajaran", icon: "📚" },
  certificate: { label: "Sertifikasi", icon: "🏆" },
  payment: { label: "Pembayaran", icon: "💳" },
  other: { label: "Lainnya", icon: "💬" },
};

const priorityConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  low: {
    label: "Rendah",
    color: "text-green-700",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  medium: {
    label: "Sedang",
    color: "text-amber-700",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  high: {
    label: "Tinggi",
    color: "text-orange-700",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  urgent: {
    label: "Urgent",
    color: "text-red-700",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
};

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  open: {
    label: "Menunggu",
    color: "text-blue-700",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: ClockIcon,
  },
  in_progress: {
    label: "Diproses",
    color: "text-amber-700",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: ArrowPathIcon,
  },
  resolved: {
    label: "Selesai",
    color: "text-green-700",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: CheckCircleIcon,
  },
  closed: {
    label: "Ditutup",
    color: "text-slate-700",
    bgColor: "bg-slate-100 dark:bg-slate-900/30",
    icon: CheckCircleIcon,
  },
};

export default function InstructorSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    supportApi
      .getTickets()
      .then((data) => {
        if (!isMounted) return;
        setTickets(data.tickets || []);
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error?.response?.data?.message || "Gagal memuat tiket");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "active")
        return ticket.status === "open" || ticket.status === "in_progress";
      return ticket.status === filterStatus;
    });
  }, [tickets, filterStatus]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter(
        (t) => t.status === "resolved" || t.status === "closed",
      ).length,
    }),
    [tickets],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <LifebuoyIcon className="h-7 w-7 text-pln-primary" />
            Bantuan & Support
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Laporkan kendala atau koordinasi dengan admin
          </p>
        </div>
        <Link
          href="/instructor/support/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-pln-primary hover:bg-pln-dark text-white font-medium rounded-xl transition-all shadow-lg shadow-pln-primary/25 hover:shadow-xl hover:shadow-pln-primary/30"
        >
          <PlusIcon className="h-5 w-5" />
          Buat Tiket Baru
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700">
              <TicketIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-xs text-slate-500">Total Tiket</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              <p className="text-xs text-slate-500">Menunggu</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <ArrowPathIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {stats.inProgress}
              </p>
              <p className="text-xs text-slate-500">Diproses</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </p>
              <p className="text-xs text-slate-500">Selesai</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2"
      >
        <FunnelIcon className="h-5 w-5 text-slate-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-4 text-sm text-slate-800 dark:text-slate-200 focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20"
        >
          <option value="all">Semua Tiket</option>
          <option value="active">Aktif</option>
          <option value="open">Menunggu</option>
          <option value="in_progress">Diproses</option>
          <option value="resolved">Selesai</option>
        </select>
      </motion.div>

      {/* Ticket List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {errorMessage}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <TicketIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
              Belum ada tiket
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Buat tiket baru jika Anda membutuhkan bantuan
            </p>
            <Link
              href="/instructor/support/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-pln-primary hover:bg-pln-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Buat Tiket
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredTickets.map((ticket, index) => {
              const StatusIcon = statusConfig[ticket.status].icon;
              const repliesCount = ticket.replies_count ?? 0;
              const category = categoryLabels[ticket.category] || {
                label: "Lainnya",
                icon: "📋",
              };

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/instructor/support/${ticket.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {/* Category Icon */}
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                      {category.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {ticket.ticket_number}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[ticket.priority].bgColor} ${priorityConfig[ticket.priority].color}`}
                        >
                          {ticket.priority === "urgent" && (
                            <ExclamationTriangleIcon className="h-3 w-3" />
                          )}
                          {priorityConfig[ticket.priority].label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[ticket.status].bgColor} ${statusConfig[ticket.status].color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[ticket.status].label}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{category.label}</span>
                        <span>•</span>
                        <span>{formatDate(ticket.created_at)}</span>
                        {repliesCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{repliesCount} balasan</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRightIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
