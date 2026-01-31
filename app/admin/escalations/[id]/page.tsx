"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  escalationApi,
  EscalationTicket,
  EscalationReply,
} from "@/lib/api/escalation";
import { useAuth } from "@/contexts/AuthContext";

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "Diproses",
  resolved: "Selesai",
  closed: "Ditutup",
};

export default function EscalationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<EscalationTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ticketId = Number(params.id);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.replies]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await escalationApi.getTicket(ticketId);
      setTicket(data);
    } catch (error) {
      console.error("Error loading ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await escalationApi.addReply(ticketId, message);
      setMessage("");
      await loadTicket();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      await escalationApi.updateStatus(ticketId, "closed");
      await loadTicket();
    } catch (error) {
      console.error("Error closing ticket:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
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
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-slate-500">Tiket tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-400">
                {ticket.ticket_number}
              </span>
              <Badge className={priorityColors[ticket.priority]}>
                {ticket.priority.toUpperCase()}
              </Badge>
              <Badge className={statusColors[ticket.status]}>
                {statusLabels[ticket.status]}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {ticket.subject}
            </h1>
          </div>
          {ticket.status !== "closed" && (
            <Button variant="outline" onClick={handleCloseTicket}>
              Tutup Tiket
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Chat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Support Ticket History (if escalation) */}
          {ticket.type === "escalation" && ticket.support_ticket && (
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    History Tiket Asli: {ticket.support_ticket.ticket_number}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {ticket.support_ticket.subject}
                </p>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50">
                {ticket.support_ticket.replies?.map((reply, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                        {reply.user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {reply.user.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 pl-8">
                      {reply.message}
                    </p>
                  </div>
                ))}
                {(!ticket.support_ticket.replies ||
                  ticket.support_ticket.replies.length === 0) && (
                  <p className="text-sm text-slate-400 italic">
                    Tidak ada history percakapan
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Escalation Discussion */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="bg-gradient-to-r from-pln-primary to-pln-light px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="font-medium">Diskusi dengan Super Admin</span>
              </div>
            </div>

            {/* Initial Description */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-pln-primary flex items-center justify-center text-white text-sm font-medium">
                  {ticket.admin?.name.charAt(0) || "A"}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {ticket.admin?.name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
              </div>
              <div className="pl-10">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* Replies */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {ticket.replies?.map((reply) => (
                <div
                  key={reply.id}
                  className={`flex ${
                    Number(reply.user_id) === Number(user?.id)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      Number(reply.user_id) === Number(user?.id)
                        ? "bg-pln-primary/10 dark:bg-pln-900/30"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {reply.user.name}
                      </span>
                      {reply.user.role === "superadmin" && (
                        <ShieldCheckIcon className="h-3 w-3 text-pln-primary" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {reply.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(reply.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input or Status Message */}
            {!["closed", "resolved"].includes(ticket.status) ? (
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-100 dark:border-slate-800"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ketik balasan..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="bg-gradient-to-r from-pln-primary to-pln-light"
                  >
                    {sending ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-6 bg-slate-50 border-t border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LockClosedIcon className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-slate-900 dark:text-white font-medium mb-1">
                  Tiket Telah Diselesaikan
                </h3>
                <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
                  Percakapan pada tiket ini telah ditutup. Jika Anda memiliki
                  kendala baru, silakan buat tiket baru.
                </p>
                <Button
                  onClick={() => router.push("/admin/escalations/create")}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Buat Tiket Baru
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Info */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Informasi Tiket
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">Tipe</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {ticket.type === "escalation"
                    ? "🔼 Eskalasi"
                    : "📝 Tiket Mandiri"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Kategori</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {ticket.category.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Dibuat</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {formatDate(ticket.created_at)}
                </p>
              </div>
              {ticket.superadmin && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ditangani oleh</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {ticket.superadmin.name}
                  </p>
                </div>
              )}
              {ticket.resolved_at && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Diselesaikan</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(ticket.resolved_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
