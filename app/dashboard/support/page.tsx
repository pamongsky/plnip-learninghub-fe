"use client";

import { useState, useEffect } from "react";
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
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { supportApi, type SupportTicket } from "@/lib/api";

const categoryLabels: Record<string, { label: string; icon: string }> = {
  technical: { label: "Teknis", icon: "🔧" },
  learning: { label: "Pembelajaran", icon: "📚" },
  certificate: { label: "Sertifikat", icon: "🏆" },
  payment: { label: "Pembayaran", icon: "💳" },
  other: { label: "Lainnya", icon: "💬" },
  // Legacy mappings
  access: { label: "Akses Kelas", icon: "🔐" },
  material: { label: "Materi Pembelajaran", icon: "📚" },
  account: { label: "Akun & Login", icon: "👤" },
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  open: { label: "Menunggu", color: "text-blue-700", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: ClockIcon },
  in_progress: { label: "Diproses", color: "text-amber-700", bgColor: "bg-amber-100 dark:bg-amber-900/30", icon: ArrowPathIcon },
  resolved: { label: "Selesai", color: "text-green-700", bgColor: "bg-green-100 dark:bg-green-900/30", icon: CheckCircleIcon },
  closed: { label: "Ditutup", color: "text-slate-700", bgColor: "bg-slate-100 dark:bg-slate-900/30", icon: CheckCircleIcon },
};

export default function UserSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const loadTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { status?: string } = {};
      if (filterStatus !== "all" && filterStatus !== "active") {
        params.status = filterStatus;
      }

      const response = await supportApi.getTickets(params);
      let ticketData = response.tickets;

      // Handle "active" filter client-side
      if (filterStatus === "active") {
        ticketData = ticketData.filter(
          (t) => t.status === "open" || t.status === "in_progress"
        );
      }

      setTickets(ticketData);
    } catch (err: any) {
      console.error("Error loading tickets:", err);
      setError(err.response?.data?.message || "Gagal memuat tiket. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pln-primary to-pln-light p-6 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <LifebuoyIcon className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Butuh Bantuan?</h1>
          </div>
          <p className="text-white/80 max-w-xl">
            Sampaikan kendala atau pertanyaan Anda, tim kami siap membantu.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -right-5 -bottom-10 h-32 w-32 rounded-full bg-white/10" />
      </motion.div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <Link
          href="/dashboard/support/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-pln-primary hover:bg-pln-dark text-white font-medium rounded-xl transition-all shadow-lg shadow-pln-primary/25 hover:shadow-xl hover:shadow-pln-primary/30"
        >
          <PlusIcon className="h-5 w-5" />
          Buat Tiket Baru
        </Link>

        {/* Filter */}
        <div className="flex items-center gap-2">
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
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4"
        >
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={loadTickets}
              className="ml-auto text-sm font-medium text-red-600 hover:text-red-700"
            >
              Coba Lagi
            </button>
          </div>
        </motion.div>
      )}

      {/* Ticket List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <TicketIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 font-medium text-slate-900 dark:text-white">
              Belum ada tiket
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Buat tiket baru jika Anda membutuhkan bantuan
            </p>
            <Link
              href="/dashboard/support/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-pln-primary hover:bg-pln-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Buat Tiket
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {tickets.map((ticket, index) => {
              const StatusIcon = statusConfig[ticket.status]?.icon || ClockIcon;
              const category = categoryLabels[ticket.category] || categoryLabels.other;
              const statusStyle = statusConfig[ticket.status] || statusConfig.open;

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/dashboard/support/${ticket.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {/* Category Icon */}
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                      {category.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {ticket.ticket_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusStyle.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{category.label}</span>
                        <span>•</span>
                        <span>{formatDate(ticket.created_at)}</span>
                        {ticket.replies_count && ticket.replies_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{ticket.replies_count} balasan</span>
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

      {/* Help Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6"
      >
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          Tips Membuat Tiket
        </h3>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-pln-primary">•</span>
            Jelaskan masalah dengan detail agar tim kami bisa membantu lebih cepat
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pln-primary">•</span>
            Sertakan screenshot jika diperlukan untuk memperjelas kendala
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
