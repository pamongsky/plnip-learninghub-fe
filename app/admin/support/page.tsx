"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TicketIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supportApi, type SupportTicket, type TicketStats } from "@/lib/api";

const priorityConfig: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  low: {
    label: "Low",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  medium: {
    label: "Medium",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  high: {
    label: "High",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  urgent: {
    label: "Urgent",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

const statusConfig: Record<string, { label: string; badge: string }> = {
  open: { label: "Open", badge: "bg-blue-100 text-blue-700" },
  in_progress: { label: "In Progress", badge: "bg-amber-100 text-amber-700" },
  resolved: { label: "Resolved", badge: "bg-emerald-100 text-emerald-700" },
  closed: { label: "Closed", badge: "bg-slate-100 text-slate-700" },
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    fetchData();
  }, [filterStatus, page]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        supportApi.getTickets({
          status: filterStatus === "all" ? undefined : filterStatus,
          page,
        }),
        supportApi.getStats(),
      ]);

      setTickets(ticketsData.tickets);
      setMeta(ticketsData.meta);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching support data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityStyle = (priority: string) => {
    return priorityConfig[priority] || priorityConfig.medium;
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ticket.subject.toLowerCase().includes(term) ||
      ticket.ticket_number.toLowerCase().includes(term) ||
      ticket.user?.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
        <p className="mt-1 text-slate-500">
          Kelola keluhan dan kendala dari pengguna
        </p>
      </motion.div>

      {/* Stats Cards - Updated to match screenshot */}
      {stats && (
        <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <TicketIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs font-medium text-slate-500">Total Tiket</p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ClockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.open}</p>
              <p className="text-xs font-medium text-blue-600">Open</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <ArrowPathIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">
                {stats.in_progress}
              </p>
              <p className="text-xs font-medium text-amber-600">In Progress</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                {stats.resolved}
              </p>
              <p className="text-xs font-medium text-emerald-600">Resolved</p>
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">
                {(stats.by_priority?.high || 0) +
                  (stats.by_priority?.urgent || 0)}
              </p>
              <p className="text-xs font-medium text-red-600">Urgent</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters - Updated style */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nomor tiket, subjek, atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-0 bg-transparent focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2 p-1">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] border-0 bg-slate-50 hover:bg-slate-100 h-9 rounded-lg text-xs font-medium">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          {/* Placeholder filters to match screenshot (functionality can be added later if needed) */}
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] border-0 bg-slate-50 hover:bg-slate-100 h-9 rounded-lg text-xs font-medium">
              <SelectValue placeholder="Semua Prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px] border-0 bg-slate-50 hover:bg-slate-100 h-9 rounded-lg text-xs font-medium">
              <SelectValue placeholder="Semua Sumber" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sumber</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ticket List - Updated to match screenshot style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-3"
      >
        {isLoading && tickets.length === 0 ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-white border border-slate-200 animate-pulse"
            />
          ))
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => {
            const priorityStyle = getPriorityStyle(ticket.priority);
            const statusStyle =
              statusConfig[ticket.status] || statusConfig.open;

            return (
              <Link
                key={ticket.id}
                href={`/admin/support/${ticket.id}`}
                className="group block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-pln-light hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar Circle with Initials */}
                  <div
                    className={`mt-1 h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                      ticket.user?.role === "instructor"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {ticket.user?.name?.charAt(0) || "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top Row: User Role Badge, ID, Priority Badge, Status Badge (Mobile only) */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          ticket.user?.role === "instructor"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <UserCircleIcon className="w-3 h-3" />
                        {ticket.user?.role === "instructor"
                          ? "Instruktur"
                          : "Peserta"}
                      </span>

                      <span className="font-mono text-[10px] text-slate-400">
                        #{ticket.ticket_number}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityStyle.color} ${priorityStyle.bgColor} ${priorityStyle.borderColor}`}
                      >
                        {priorityConfig[ticket.priority]?.label ||
                          ticket.priority}
                      </span>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle.badge}`}
                      >
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Subject */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-pln-primary truncate mb-1">
                      {ticket.subject}
                    </h3>

                    {/* Bottom Row: User Name, Category, Time, Replies */}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-700">
                        {ticket.user?.name || "Unknown User"}
                      </span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                      {ticket.replies_count !== undefined &&
                        ticket.replies_count > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              <ChatBubbleLeftRightIcon className="h-3 w-3" />
                              {ticket.replies_count} balasan
                            </span>
                          </>
                        )}
                    </div>
                  </div>

                  {/* Right Side Arrow */}
                  <div className="flex items-center self-center pl-4 text-slate-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-slate-200">
            <TicketIcon className="h-16 w-16 text-slate-200" />
            <p className="mt-4 font-medium text-slate-900">
              Tidak ada ticket ditemukan
            </p>
            <p className="text-sm text-slate-500">
              Belum ada keluhan yang masuk sesuai filter ini.
            </p>
          </div>
        )}
      </motion.div>

      {/* Pagination (Simple) */}
      {meta.last_page > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-slate-600">
            Page {page} of {meta.last_page}
          </span>
          <Button
            variant="outline"
            disabled={page === meta.last_page}
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
