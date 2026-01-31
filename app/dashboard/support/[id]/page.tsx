"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { supportApi, type SupportTicket, type SupportReply } from "@/lib/api";
import { useSupportTicketChannel } from "@/hooks/useRealTimeMessages";

// Extended type with replies
interface TicketWithReplies extends SupportTicket {
  replies: SupportReply[];
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  access: { label: "Akses Kelas", icon: "🔐" },
  material: { label: "Materi Pembelajaran", icon: "📚" },
  certificate: { label: "Sertifikat", icon: "🏆" },
  account: { label: "Akun & Login", icon: "👤" },
  other: { label: "Lainnya", icon: "💬" },
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; textColor: string; icon: any }> = {
  open: { label: "Menunggu Respon", color: "border-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-700 dark:text-blue-400", icon: ClockIcon },
  in_progress: { label: "Sedang Diproses", color: "border-amber-500", bgColor: "bg-amber-50 dark:bg-amber-900/20", textColor: "text-amber-700 dark:text-amber-400", icon: ArrowPathIcon },
  resolved: { label: "Selesai", color: "border-green-500", bgColor: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-700 dark:text-green-400", icon: CheckCircleIcon },
  closed: { label: "Ditutup", color: "border-slate-500", bgColor: "bg-slate-50 dark:bg-slate-900/20", textColor: "text-slate-700 dark:text-slate-400", icon: XCircleIcon },
};

export default function UserSupportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<TicketWithReplies | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  // Real-time: Listen for new replies
  const handleNewReply = useCallback((data: any) => {
    // Add new reply to the list
    const newReply: SupportReply = {
      id: data.id,
      ticket_id: data.ticket_id,
      user_id: data.user_id,
      message: data.message,
      is_admin_reply: data.is_admin_reply,
      created_at: data.created_at,
      user: data.user,
    };

    setTicket((prev) => {
      if (!prev) return prev;
      // Avoid duplicates
      if (prev.replies.some(r => r.id === newReply.id)) return prev;
      return {
        ...prev,
        replies: [...prev.replies, newReply],
      };
    });
  }, []);

  // Subscribe to real-time support ticket channel
  useSupportTicketChannel(ticketId, handleNewReply);

  const loadTicket = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supportApi.getTicket(ticketId);
      setTicket(data as TicketWithReplies);
    } catch (err: any) {
      console.error("Error loading ticket:", err);
      setError(err.response?.data?.message || "Gagal memuat tiket");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "Baru saja";
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatDate(dateString);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !ticket) return;

    setIsSubmitting(true);

    try {
      await supportApi.addReply(ticketId, replyMessage.trim());

      // Reload ticket to get updated replies
      await loadTicket();
      setReplyMessage("");
    } catch (err: any) {
      console.error("Error sending reply:", err);
      setError(err.response?.data?.message || "Gagal mengirim balasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/support"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
          </div>
        </div>
        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Error state
  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/support"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Detail Tiket
          </h1>
        </div>
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1">
            {error || "Tiket tidak ditemukan"}
          </h3>
          <button
            onClick={loadTicket}
            className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = statusConfig[ticket.status] || statusConfig.open;
  const StatusIcon = statusStyle.icon;
  const category = categoryLabels[ticket.category] || categoryLabels.other;
  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <Link
          href="/dashboard/support"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors mt-1"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
              {ticket.ticket_number}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusStyle.label}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {ticket.subject}
          </h1>
        </div>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-xl border-l-4 p-4 ${statusStyle.bgColor} ${statusStyle.color}`}
      >
        <div className="flex items-center gap-3">
          <StatusIcon className={`h-5 w-5 ${statusStyle.textColor}`} />
          <div>
            <p className={`font-medium ${statusStyle.textColor}`}>
              {ticket.status === "open" && "Tiket Anda sedang menunggu respon dari tim support."}
              {ticket.status === "in_progress" && "Tim support sedang menangani tiket Anda."}
              {ticket.status === "resolved" && "Tiket Anda telah diselesaikan. Terima kasih!"}
              {ticket.status === "closed" && "Tiket ini telah ditutup."}
            </p>
            {ticket.assigned_admin && ticket.status !== "open" && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Ditangani oleh: {ticket.assigned_admin.name}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col h-screen max-h-screen">
          {/* Messages Container - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {/* Original Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Message Header */}
            <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="h-10 w-10 rounded-full bg-pln-primary flex items-center justify-center text-sm font-semibold text-white">
                {getInitials("Anda")}
              </div>
              <div className="flex-1">
                <span className="font-medium text-slate-900 dark:text-white">
                  Anda
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(ticket.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-4">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </div>
          </motion.div>

          {/* Replies */}
          {ticket.replies.map((reply, index) => (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
              className={`rounded-2xl border overflow-hidden ${
                reply.is_admin_reply
                  ? "bg-pln-primary/5 dark:bg-pln-primary/10 border-pln-primary/20"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className={`flex items-center gap-4 p-4 border-b ${
                reply.is_admin_reply
                  ? "border-pln-primary/20 bg-pln-primary/5"
                  : "border-slate-200 dark:border-slate-700"
              }`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  reply.is_admin_reply
                    ? "bg-pln-primary text-white"
                    : "bg-slate-600 text-white"
                }`}>
                  {getInitials(reply.user.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {reply.user.name}
                    </span>
                    {reply.is_admin_reply && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pln-primary text-white">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formatRelativeDate(reply.created_at)}
                </span>
              </div>
              <div className="p-4">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {reply.message}
                </p>
              </div>
            </motion.div>
          ))}
          </div>

          {/* Reply Input - Hide if resolved/closed */}
          {!isResolved ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-shrink-0 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Balas Pesan
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Tulis balasan atau informasi tambahan..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20"
                />
                <div className="flex justify-end mt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pln-primary text-white font-medium hover:bg-pln-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4" />
                        Kirim Balasan
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 text-center"
            >
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Tiket Telah Diselesaikan
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Jika Anda memiliki pertanyaan lain, silakan buat tiket baru.
              </p>
              <Link
                href="/dashboard/support/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-pln-primary text-white text-sm font-medium rounded-xl hover:bg-pln-dark transition-colors"
              >
                Buat Tiket Baru
              </Link>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Ticket Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Informasi Tiket
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Ticket Number */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Nomor Tiket
                </label>
                <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">
                  {ticket.ticket_number}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Status
                </label>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusStyle.label}
                </span>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Kategori
                </label>
                <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>{category.icon}</span>
                  {category.label}
                </p>
              </div>

              {/* Created */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Dibuat
                </label>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {formatDate(ticket.created_at)}
                </p>
              </div>

              {/* Assigned Admin */}
              {ticket.assigned_admin && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Ditangani Oleh
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {ticket.assigned_admin.name}
                  </p>
                </div>
              )}

              {/* Resolved */}
              {ticket.resolved_at && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Diselesaikan
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(ticket.resolved_at)}
                  </p>
                </div>
              )}

              {/* Replies Count */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Balasan
                </label>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {ticket.replies.length} pesan
                </p>
              </div>
            </div>
          </motion.div>

          {/* Help */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4"
          >
            <h4 className="font-medium text-slate-900 dark:text-white mb-2 text-sm">
              Butuh bantuan cepat?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Untuk kendala urgent, hubungi helpdesk di ext. 1234 pada jam kerja.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
