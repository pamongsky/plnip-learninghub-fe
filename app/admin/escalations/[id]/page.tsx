"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  LockClosedIcon,
  DocumentIcon,
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
import { useEscalationTicketChannel } from "@/hooks/useRealTimeMessages";
import { ChatReplyBox } from "@/components/support/ChatReplyBox";

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
  const [error, setError] = useState<string | null>(null);
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

  // Real-time: Handle new replies from broadcasting
  const handleNewReply = useCallback(
    (data: EscalationReply) => {
      // Skip if this is our own reply (already added via optimistic update)
      if (user && data.user_id === user.id) {
        return;
      }

      // Add new reply to the list
      const newReply: EscalationReply = {
        id: data.id,
        escalation_ticket_id: data.escalation_ticket_id,
        user_id: data.user_id,
        message: data.message,
        attachments: data.attachments || null,
        is_internal: data.is_internal || false,
        created_at: data.created_at,
        user: data.user,
      };

      setTicket((prev) => {
        if (!prev) return prev;

        // Avoid duplicates
        const exists = prev.replies?.some((r) => r.id === newReply.id);
        if (exists) {
          return prev;
        }

        return {
          ...prev,
          replies: [...(prev.replies || []), newReply],
        };
      });

      // Auto scroll to new message
      setTimeout(() => scrollToBottom(), 100);
    },
    [user],
  );

  // Real-time: Handle status updates from broadcasting
  const handleStatusUpdate = useCallback((data: { status: string; resolved_at?: string; superadmin_id?: number; updated_at: string }) => {
    setTicket((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        status: data.status,
        resolved_at: data.resolved_at || prev.resolved_at,
        superadmin_id: data.superadmin_id || prev.superadmin_id,
        updated_at: data.updated_at,
      };
    });
  }, []);

  // Subscribe to real-time escalation ticket channel
  useEscalationTicketChannel(ticketId, handleNewReply, handleStatusUpdate);

  const loadTicket = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const data = await escalationApi.getTicket(ticketId);
      setTicket(data);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string }; status?: number } }).response?.data?.message || "Gagal memuat tiket"
        : error instanceof Error ? error.message : "Gagal memuat tiket";
      if (!silent) {
        setError(errorMessage);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!message.trim() || sending) {
      return;
    }

    setSending(true);

    const currentMessage = message;

    // Clear input immediately (optimistic UI)
    setMessage("");

    try {
      const response = await escalationApi.addReply(ticketId, currentMessage);

      // Optimistic update - add our own reply immediately
      if (response.reply) {
        setTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            replies: [...(prev.replies || []), response.reply],
          };
        });
      }

      // No need to reload - broadcasting will update for other users
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      // error handled silently
      // Restore message on error
      setMessage(currentMessage);
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      await escalationApi.updateStatus(ticketId, "closed");
      await loadTicket();
    } catch (error) {
      // error handled silently
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

  const getAttachmentUrl = (attachment: string) => {
    if (attachment.startsWith("http")) return attachment;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ""}${attachment.startsWith("/") ? "" : "/"}${attachment}`;
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
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Tiket Tidak Ditemukan
          </h2>
          <p className="text-slate-500 mb-4">
            {error ||
              "Tiket dengan ID tersebut tidak ditemukan atau Anda tidak memiliki akses."}
          </p>
          <p className="text-sm text-slate-400 mb-4">Ticket ID: {ticketId}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
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
              <div className="p-4 max-h-96 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
                {/* Original Ticket Description (First Message) */}
                <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-medium text-white">
                      {ticket.support_ticket.user?.name.charAt(0) || "U"}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {ticket.support_ticket.user?.name || "User"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(ticket.support_ticket.created_at)}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded">
                      Pelaporan Awal
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 pl-8 whitespace-pre-wrap">
                    {ticket.support_ticket.description}
                  </p>

                  {/* Attachments dari ticket description */}
                  {ticket.support_ticket.attachments &&
                    ticket.support_ticket.attachments.length > 0 && (
                      <div className="pl-8 mt-2 space-y-1">
                        {ticket.support_ticket.attachments.map(
                          (attachment, idx) => {
                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                              attachment,
                            );
                            const attachmentUrl = getAttachmentUrl(attachment);
                            return (
                              <div key={idx}>
                                {isImage ? (
                                  <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={attachmentUrl}
                                      alt="Attachment"
                                      className="max-w-xs rounded border border-slate-200 hover:opacity-90 transition-opacity"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <DocumentIcon className="h-4 w-4" />
                                    {attachment.split("/").pop()}
                                  </a>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                </div>

                {/* Replies */}
                {ticket.support_ticket.replies?.map((reply, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                          reply.is_admin_reply
                            ? "bg-gradient-to-br from-pln-primary to-pln-light"
                            : "bg-gradient-to-br from-blue-500 to-blue-600"
                        }`}
                      >
                        {reply.user?.name.charAt(0) || "?"}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {reply.user?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(reply.created_at)}
                      </span>
                      {reply.is_admin_reply && (
                        <span className="text-xs bg-pln-100 text-pln-700 dark:bg-pln-900/30 dark:text-pln-400 px-2 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 pl-8 whitespace-pre-wrap">
                      {reply.message}
                    </p>

                    {/* Attachments dari reply */}
                    {reply.attachments && reply.attachments.length > 0 && (
                      <div className="pl-8 mt-2 space-y-1">
                        {reply.attachments.map((attachment, idx) => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                            attachment,
                          );
                          const attachmentUrl = getAttachmentUrl(attachment);
                          return (
                            <div key={idx}>
                              {isImage ? (
                                <a
                                  href={attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={attachmentUrl}
                                    alt="Attachment"
                                    className="max-w-xs rounded border border-slate-200 hover:opacity-90 transition-opacity"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <DocumentIcon className="h-4 w-4" />
                                  {attachment.split("/").pop()}
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {(!ticket.support_ticket.replies ||
                  ticket.support_ticket.replies.length === 0) && (
                  <p className="text-sm text-slate-400 italic text-center py-2">
                    Belum ada balasan di tiket asli
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
            <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
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
                    className={`max-w-[80%] rounded-lg px-2.5 py-2 ${
                      Number(reply.user_id) === Number(user?.id)
                        ? "bg-pln-primary/10 dark:bg-pln-900/30"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
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
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(reply.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input or Status Message */}
            {!["closed", "resolved"].includes(ticket.status) ? (
              <ChatReplyBox
                value={message}
                onChange={setMessage}
                onSend={(e?: React.FormEvent) => {
                  e?.preventDefault?.();
                  handleSendMessage(e || { preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent);
                }}
                isSubmitting={sending}
                placeholder="Ketik balasan..."
                label="Diskusi dengan Super Admin"
              />
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
