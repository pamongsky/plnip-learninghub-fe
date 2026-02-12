"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TicketIcon,
  FunnelIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  UserCircleIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/badge";
import {
  escalationApi,
  EscalationTicket,
  EscalationStats,
} from "@/lib/api/escalation";
import { supportApi, SupportTicket } from "@/lib/api/support";

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
  escalated:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  escalated: "Eskalasi",
};

const typeLabels: Record<string, { label: string; icon: string }> = {
  escalation: { label: "Eskalasi", icon: "🔼" },
  standalone: { label: "Tiket Admin", icon: "📝" },
};

export default function SuperadminEscalationsPage() {
  const [activeTab, setActiveTab] = useState<"escalations" | "global">(
    "escalations",
  );

  // Escalation Data
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [stats, setStats] = useState<EscalationStats | null>(null);

  // Global Support Tickets Data
  const [globalTickets, setGlobalTickets] = useState<SupportTicket[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    if (activeTab === "escalations") {
      loadEscalationData();
    } else {
      loadGlobalData();
    }
  }, [activeTab, filter, typeFilter]);

  const loadEscalationData = async () => {
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
      console.error("Error loading escalations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalData = async () => {
    try {
      setGlobalLoading(true);
      const res = await supportApi.getTickets({
        status: filter !== "all" ? filter : undefined,
      });
      setGlobalTickets(res.tickets);
    } catch (error) {
      console.error("Error loading global tickets:", error);
    } finally {
      setGlobalLoading(false);
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
            Super Admin Panel
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
                Tracking & Eskalasi Tiket
              </h1>
              <p className="text-slate-500 mt-1 dark:text-slate-400">
                Pusat monitoring seluruh tiket di platform 
              </p>
            </div>
            <Button
              onClick={() =>
                activeTab === "escalations"
                  ? loadEscalationData()
                  : loadGlobalData()
              }
              variant="outline"
              className="gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit"
        >
          <button
            onClick={() => setActiveTab("escalations")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "escalations"
                ? "bg-white dark:bg-slate-700 text-pln-primary shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            Eskalasi & Admin
          </button>
          <button
            onClick={() => setActiveTab("global")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "global"
                ? "bg-white dark:bg-slate-700 text-pln-primary shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <GlobeAltIcon className="w-4 h-4" />
            Semua Tiket User
          </button>
        </motion.div>

        {/* content based on activeTab */}
        {activeTab === "escalations" ? (
          <>
            {/* Stats Cards (Only for Escalations currently) */}
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
                  <div className="rounded-xl bg-red-100 p-2 dark:bg-red-900/30">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats?.open || 0}
                    </p>
                    <p className="text-xs text-slate-500">Perlu Ditangani</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-100 p-2 dark:bg-amber-900/30">
                    <ArrowUpIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats?.escalations || 0}
                    </p>
                    <p className="text-xs text-slate-500">Eskalasi</p>
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
                    <p className="text-xs text-slate-500">Diselesaikan</p>
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

            {/* Escalation Ticket List */}
            <motion.div variants={itemVariants} className="space-y-3">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                  <TicketIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Tidak ada tiket eskalasi
                  </h3>
                  <p className="text-slate-500">
                    Belum ada tiket dari Admin yang perlu ditangani saat ini.
                  </p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/superadmin/escalations/${ticket.id}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-lg hover:border-pln-primary/30 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {/* Admin Avatar */}
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pln-primary to-pln-dark flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                            {ticket.admin?.name.charAt(0) || "A"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-lg">
                                {typeLabels[ticket.type]?.icon}
                              </span>
                              <span className="text-xs font-medium text-slate-400">
                                {ticket.ticket_number}
                              </span>
                              <Badge
                                className={priorityColors[ticket.priority]}
                              >
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
                                <UserCircleIcon className="h-3 w-3" />
                                {ticket.admin?.name || "Admin"}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {formatDate(ticket.created_at)}
                              </span>
                              {ticket.replies_count &&
                                ticket.replies_count > 0 && (
                                  <span>{ticket.replies_count} balasan</span>
                                )}
                            </div>
                          </div>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-slate-300 group-hover:text-pln-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </motion.div>
          </>
        ) : (
          <>
            {/* Global User Tickets */}
            <motion.div
              variants={itemVariants}
              className="mb-6 flex flex-wrap gap-2"
            >
              <div className="flex items-center gap-2 mr-4">
                <FunnelIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-500">Filter Status:</span>
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
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3">
              {globalLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : globalTickets.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                  <GlobeAltIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Tidak ada tiket user
                  </h3>
                  <p className="text-slate-500">
                    Belum ada tiket support dari user di seluruh unit.
                  </p>
                </div>
              ) : (
                globalTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/superadmin/monitoring/${ticket.id}`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-medium text-sm flex-shrink-0">
                            {ticket.user?.name.charAt(0) || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-medium text-slate-400">
                                {ticket.ticket_number}
                              </span>
                              <Badge
                                className={priorityColors[ticket.priority]}
                              >
                                {ticket.priority?.toUpperCase()}
                              </Badge>
                              <Badge className={statusColors[ticket.status]}>
                                {statusLabels[ticket.status]}
                              </Badge>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase">
                                {ticket.category}
                              </span>
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-pln-primary">
                              {ticket.subject}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <UserCircleIcon className="h-3 w-3" />
                                {ticket.user?.name || "User"}
                              </span>
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {formatDate(ticket.created_at)}
                              </span>
                              {/* We could add Unit info here if available in user details */}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 flex flex-col items-end gap-1">
                          <span className="flex items-center gap-1">
                            <BuildingOffice2Icon className="w-3 h-3" />
                            Diproses Unit
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
