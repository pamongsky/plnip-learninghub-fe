"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  TagIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  PaperClipIcon,
  XMarkIcon,
  EyeIcon,
  DocumentIcon,
  ArrowUpCircleIcon,
} from "@heroicons/react/24/outline";
import { supportApi, type SupportTicket, type SupportReply } from "@/lib/api";
import { escalationApi } from "@/lib/api/escalation";
import { useSupportTicketChannel } from "@/hooks/useRealTimeMessages";

// Extended type with replies
interface TicketWithReplies extends SupportTicket {
  replies: SupportReply[];
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  technical: { label: "Masalah Teknis", icon: "🔧" },
  learning: { label: "Pembelajaran", icon: "📚" },
  certificate: { label: "Sertifikat", icon: "🏆" },
  payment: { label: "Pembayaran", icon: "💳" },
  other: { label: "Lainnya", icon: "💬" },
  // Legacy
  access: { label: "Akses Kelas", icon: "🔐" },
  material: { label: "Materi", icon: "📚" },
  account: { label: "Akun & Login", icon: "👤" },
};

const priorityConfig: Record<
  string,
  { label: string; color: string; bgColor: string; darkBgColor: string }
> = {
  low: {
    label: "Rendah",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100",
    darkBgColor: "dark:bg-green-900/30",
  },
  medium: {
    label: "Sedang",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100",
    darkBgColor: "dark:bg-yellow-900/30",
  },
  high: {
    label: "Tinggi",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100",
    darkBgColor: "dark:bg-orange-900/30",
  },
  urgent: {
    label: "Urgent",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100",
    darkBgColor: "dark:bg-red-900/30",
  },
};

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    icon: any;
    message: string;
  }
> = {
  open: {
    label: "Menunggu",
    color: "text-blue-700",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-500",
    textColor: "text-blue-700 dark:text-blue-400",
    icon: ClockIcon,
    message: "Tiket ini menunggu penanganan dari admin.",
  },
  in_progress: {
    label: "Diproses",
    color: "text-amber-700",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-500",
    textColor: "text-amber-700 dark:text-amber-400",
    icon: ArrowPathIcon,
    message: "Tiket sedang dalam proses penanganan.",
  },
  resolved: {
    label: "Selesai",
    color: "text-green-700",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-500",
    textColor: "text-green-700 dark:text-green-400",
    icon: CheckCircleIcon,
    message: "Tiket telah diselesaikan.",
  },
  closed: {
    label: "Ditutup",
    color: "text-slate-700",
    bgColor: "bg-slate-50 dark:bg-slate-900/20",
    borderColor: "border-slate-500",
    textColor: "text-slate-700 dark:text-slate-400",
    icon: XCircleIcon,
    message: "Tiket telah ditutup.",
  },
};

export default function AdminSupportDetailPage() {
  const params = useParams();
  const ticketId = Number(params.id);

  const [ticket, setTicket] = useState<TicketWithReplies | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // No replies state duplication needed as it is in ticket object, but keeping attachments state
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Escalation modal state
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationPriority, setEscalationPriority] = useState("high");
  const [isEscalating, setIsEscalating] = useState(false);
  const [isAlreadyEscalated, setIsAlreadyEscalated] = useState(false);

  useEffect(() => {
    loadTicket();
    checkEscalationStatus();
  }, [ticketId]);

  const checkEscalationStatus = async () => {
    try {
      const result = await escalationApi.checkEscalationStatus(ticketId);
      setIsAlreadyEscalated(result.exists);
    } catch (err) {
      console.error("Error checking escalation status:", err);
    }
  };

  const handleEscalate = async () => {
    if (!escalationReason.trim()) return;

    setIsEscalating(true);
    try {
      await escalationApi.escalateTicket(ticketId, {
        reason: escalationReason.trim(),
        priority: escalationPriority,
      });
      setShowEscalationModal(false);
      setEscalationReason("");
      setIsAlreadyEscalated(true);
      await loadTicket();
    } catch (err: any) {
      console.error("Error escalating ticket:", err);
      setError(err.response?.data?.message || "Gagal eskalasi tiket");
    } finally {
      setIsEscalating(false);
    }
  };

  // Real-time: Listen for new replies
  const handleNewReply = useCallback((data: any) => {
    const newReply: SupportReply = {
      id: data.id,
      ticket_id: data.ticket_id,
      user_id: data.user_id,
      message: data.message,
      is_admin_reply: data.is_admin_reply,
      created_at: data.created_at,
      user: data.user,
      attachments: data.attachments || [],
    };

    setTicket((prev) => {
      if (!prev) return prev;
      // Avoid duplicates
      if (prev.replies.some((r) => r.id === newReply.id)) return prev;
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newAttachments = [...attachments, ...files];
      setAttachments(newAttachments);

      // Create preview URLs
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);

    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]); // Clean up memory
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  const renderAttachments = (urls: string[] | null | undefined) => {
    if (!urls || urls.length === 0) return null;

    return (
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {urls.map((url, index) => {
          const isImage = url.match(/(jpeg|jpg|png|gif)$/i);
          const fileName = url.split("/").pop();

          if (isImage) {
            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 group"
              >
                <img
                  src={url}
                  alt="Attachment"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <EyeIcon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </a>
            );
          }

          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <DocumentIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{fileName}</span>
            </a>
          );
        })}
      </div>
    );
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !ticket) return;

    setIsSubmitting(true);

    try {
      await supportApi.addReply(ticketId, replyMessage.trim(), attachments);
      await loadTicket();
      setReplyMessage("");
      setAttachments([]);
      setPreviewUrls([]);
    } catch (err: any) {
      console.error("Error sending reply:", err);
      setError(err.response?.data?.message || "Gagal mengirim balasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;

    setIsChangingStatus(true);

    try {
      await supportApi.updateStatus(ticketId, newStatus);
      await loadTicket();
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Gagal mengubah status");
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/support"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/support"
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
  const priority = priorityConfig[ticket.priority] || priorityConfig.medium;
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
          href="/admin/support"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors mt-1"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
              {ticket.ticket_number}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusStyle.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priority.bgColor} ${priority.darkBgColor} ${priority.color}`}
            >
              <FlagIcon className="h-3 w-3" />
              {priority.label}
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
        className={`rounded-xl border-l-4 p-4 ${statusStyle.bgColor} ${statusStyle.borderColor}`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <StatusIcon className={`h-5 w-5 ${statusStyle.textColor}`} />
            <div>
              <p className={`font-medium ${statusStyle.textColor}`}>
                {statusStyle.message}
              </p>
              {ticket.assigned_admin && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Ditangani oleh: {ticket.assigned_admin.name}
                </p>
              )}
            </div>
          </div>

          {/* Quick Status Actions */}
          {!isResolved && (
            <div className="flex items-center gap-2">
              {ticket.status === "open" && (
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={isChangingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  <ArrowPathIcon className="h-3.5 w-3.5" />
                  Proses
                </button>
              )}
              {(ticket.status === "open" ||
                ticket.status === "in_progress") && (
                <button
                  onClick={() => handleStatusChange("resolved")}
                  disabled={isChangingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  <CheckIcon className="h-3.5 w-3.5" />
                  Selesaikan
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div
          className="lg:col-span-2 flex flex-col"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          {/* Messages Container - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
            {/* Original Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Message Header */}
              <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="h-12 w-12 rounded-full bg-pln-primary/10 flex items-center justify-center text-sm font-semibold text-pln-primary">
                  {ticket.user ? getInitials(ticket.user.name) : "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {ticket.user?.name || "User"}
                    </span>
                    {ticket.user?.role && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                        {ticket.user.role}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {ticket.user?.email}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {formatRelativeDate(ticket.created_at)}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </p>
                {renderAttachments(ticket.attachments)}
              </div>
            </motion.div>

            {/* Replies */}
            {ticket.replies &&
              ticket.replies.map((reply, index) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className={`rounded-2xl border overflow-hidden ${
                    reply.is_admin_reply
                      ? "bg-pln-primary/5 dark:bg-pln-primary/10 border-pln-primary/20"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div
                    className={`flex items-center gap-4 p-4 border-b ${
                      reply.is_admin_reply
                        ? "border-pln-primary/20 bg-pln-primary/5"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        reply.is_admin_reply
                          ? "bg-pln-primary text-white"
                          : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white"
                      }`}
                    >
                      {reply.user ? getInitials(reply.user.name) : "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {reply.user?.name || "User"}
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
                    {renderAttachments(reply.attachments)}
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Reply Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 mt-4"
          >
            <div className="p-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Balas sebagai Admin
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Tulis balasan untuk user..."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20"
              />

              {/* Attachment Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <img
                        src={url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-red-500 transition-colors"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div>
                  <input
                    type="file"
                    id="attachment-upload"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="attachment-upload"
                    className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-pln-primary transition-colors text-sm"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                    <span>Lampirkan File</span>
                  </label>
                </div>
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
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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
        </div>

        {/* Sidebar - Ticket Info */}
        <div className="space-y-6">
          {/* Ticket Information Card */}
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
              <div className="flex items-start gap-3">
                <TagIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Nomor Tiket
                  </label>
                  <p className="text-sm font-mono font-medium text-slate-900 dark:text-white">
                    {ticket.ticket_number}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <StatusIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-start gap-3">
                <FlagIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Prioritas
                  </label>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priority.bgColor} ${priority.darkBgColor} ${priority.color}`}
                  >
                    {priority.label}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-start gap-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Kategori
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>{category.icon}</span>
                    {category.label}
                  </p>
                </div>
              </div>

              {/* Created */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Dibuat
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
              </div>

              {/* Assigned Admin */}
              {ticket.assigned_admin && (
                <div className="flex items-start gap-3">
                  <UserCircleIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                      Ditangani Oleh
                    </label>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {ticket.assigned_admin.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Resolved */}
              {ticket.resolved_at && (
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                      Diselesaikan
                    </label>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {formatDate(ticket.resolved_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* Replies Count */}
              <div className="flex items-start gap-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Balasan
                  </label>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {ticket.replies?.length || 0} pesan
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* User Information Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Informasi User
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* User Avatar & Name */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-pln-primary/10 flex items-center justify-center text-sm font-semibold text-pln-primary">
                  {ticket.user ? getInitials(ticket.user.name) : "U"}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {ticket.user?.name || "User"}
                  </p>
                  {ticket.user?.role && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {ticket.user.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Email
                  </label>
                  <a
                    href={`mailto:${ticket.user?.email}`}
                    className="text-sm text-pln-primary hover:underline"
                  >
                    {ticket.user?.email}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Admin Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Aksi Admin
              </h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Status Change */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Ubah Status Tiket
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    const isActive = ticket.status === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        disabled={isChangingStatus || isActive}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          isActive
                            ? `${config.bgColor} ${config.textColor} ring-2 ring-offset-2 ring-current`
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                        } disabled:opacity-50`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Escalation Section */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Eskalasi ke Super Admin
                </label>
                {isAlreadyEscalated || ticket.status === "escalated" ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <ArrowUpCircleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      Tiket sudah dieskalasi
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowEscalationModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    <ArrowUpCircleIcon className="h-5 w-5" />
                    Eskalasi ke Super Admin
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Escalation Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-600 text-white">
                    <ArrowUpCircleIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Eskalasi ke Super Admin
                  </h3>
                </div>
                <button
                  onClick={() => setShowEscalationModal(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Eskalasi akan mengirimkan tiket ini ke Super Admin untuk penanganan lebih lanjut.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Alasan Eskalasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Jelaskan alasan mengapa tiket ini perlu dieskalasi..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Prioritas Eskalasi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["low", "medium", "high", "urgent"].map((p) => {
                    const config = priorityConfig[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEscalationPriority(p)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                          escalationPriority === p
                            ? `${config.bgColor} ${config.darkBgColor} ${config.color} ring-2 ring-offset-1 ring-current`
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEscalationModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalationReason.trim() || isEscalating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isEscalating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <ArrowUpCircleIcon className="h-4 w-4" />
                    Eskalasi Tiket
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
