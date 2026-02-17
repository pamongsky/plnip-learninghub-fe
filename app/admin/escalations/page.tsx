"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TicketIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/badge";
import {
  escalationApi,
  EscalationTicket,
  EscalationStats,
} from "@/lib/api/escalation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  closed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const typeLabels: Record<string, { label: string; icon: string }> = {
  escalation: { label: "Eskalasi", icon: "🔼" },
  standalone: { label: "Tiket Mandiri", icon: "📝" },
};

export default function AdminEscalationsPage() {
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [stats, setStats] = useState<EscalationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [filter, typeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        escalationApi.getTickets({
          status: filter !== "all" ? filter : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
        }),
        escalationApi.getStats(),
      ]);
      setTickets(ticketsRes.tickets);
      setStats(statsRes);
    } catch (error) {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Admin Panel
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
                Tiket ke Super Admin
              </h1>
              <p className="text-slate-500 mt-1 dark:text-slate-400">
                Buat tiket baru atau eskalasi tiket support ke Super Admin
              </p>
            </div>
            <Link href="/admin/escalations/create">
              <Button className="bg-gradient-to-r from-pln-primary to-pln-light hover:from-pln-dark hover:to-pln-primary gap-2">
                <PlusIcon className="h-5 w-5" />
                Buat Tiket Baru
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2 dark:bg-blue-900/30">
                <TicketIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.total || 0}
                </p>
                <p className="text-xs text-slate-500">Total Tiket</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2 dark:bg-amber-900/30">
                <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.open || 0}
                </p>
                <p className="text-xs text-slate-500">Menunggu</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-pln-50 p-2 dark:bg-pln-900/30">
                <ArrowPathIcon className="h-5 w-5 text-pln-primary dark:text-pln-light" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.in_progress || 0}
                </p>
                <p className="text-xs text-slate-500">Diproses</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.resolved || 0}
                </p>
                <p className="text-xs text-slate-500">Selesai</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-wrap gap-2"
        >
          <div className="flex items-center gap-2 mr-4">
            <FunnelIcon className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "open", "in_progress", "resolved", "closed"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    filter === status
                      ? "bg-pln-primary text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {status === "all" ? "Semua" : statusLabels[status]}
                </button>
              ),
            )}
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block" />
          <div className="flex flex-wrap gap-2">
            {["all", "escalation", "standalone"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? "bg-pln-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {type === "all"
                  ? "Semua Tipe"
                  : typeLabels[type]?.label || type}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Ticket List */}
        <motion.div variants={itemVariants} className="space-y-3">
          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <TicketIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Belum ada tiket
              </h3>
              <p className="text-slate-500 mb-4">
                Buat tiket baru untuk berkomunikasi dengan Super Admin
              </p>
              <Link href="/admin/escalations/create">
                <Button className="bg-gradient-to-r from-pln-primary to-pln-light">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Buat Tiket Baru
                </Button>
              </Link>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link key={ticket.id} href={`/admin/escalations/${ticket.id}`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-lg hover:border-pln-primary/30 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {typeLabels[ticket.type]?.icon}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          {ticket.ticket_number}
                        </span>
                        <Badge className={priorityColors[ticket.priority]}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                        <Badge className={statusColors[ticket.status]}>
                          {statusLabels[ticket.status]}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-pln-primary">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          {formatDate(ticket.created_at)}
                        </span>
                        {ticket.replies_count && ticket.replies_count > 0 && (
                          <span>{ticket.replies_count} balasan</span>
                        )}
                        {ticket.type === "escalation" &&
                          ticket.support_ticket && (
                            <span className="text-pln-primary">
                              Dari: {ticket.support_ticket.ticket_number}
                            </span>
                          )}
                      </div>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-slate-300 group-hover:text-pln-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
