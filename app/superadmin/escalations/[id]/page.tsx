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
  ExclamationTriangleIcon,
  LockClosedIcon,
  PhotoIcon,
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
import Image from "next/image";
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

export default function SuperadminEscalationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<EscalationTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
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
    (data: any) => {
      console.log("handleNewReply called with escalation data:", data);

      // Skip if this is our own reply (already added via optimistic update)
      if (user && data.user_id === user.id) {
        console.log("Skipping own escalation reply:", data.id);
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
          console.log("Escalation reply already exists:", newReply.id);
          return prev;
        }

        console.log("Adding new escalation reply:", newReply.id);
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
  const handleStatusUpdate = useCallback((data: any) => {
    console.log("handleStatusUpdate called:", data);

    setTicket((prev) => {
      if (!prev) return prev;

      console.log("Updating ticket status to:", data.status);
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
      if (!silent) setLoading(true);
      const data = await escalationApi.getTicket(ticketId);
      setTicket(data);
    } catch (error) {
      console.error("Error loading ticket:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files);
    setAttachments((prev) => [...prev, ...newFiles]);

    // Create preview URLs for images
    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeAttachment = (index: number) => {
    // Revoke preview URL before removing
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    console.log("handleSendMessage called");
    e.preventDefault();
    e.stopPropagation();

    if ((!message.trim() && attachments.length === 0) || sending) {
      console.log("Validation failed or already sending");
      return;
    }

    console.log("Starting to send message:", message);
    setSending(true);

    const currentMessage = message;
    const currentAttachments = [...attachments];

    // Clear input immediately (optimistic UI)
    setMessage("");
    setAttachments([]);
    // Revoke all preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);

    try {
      console.log("Calling API...");
      const response = await escalationApi.addReply(
        ticketId,
        currentMessage,
        currentAttachments,
      );
      console.log("API call successful - adding reply optimistically");

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
      console.error("Error sending message:", error);
      // Restore message on error
      setMessage(currentMessage);
      setAttachments(currentAttachments);
    } finally {
      setSending(false);
      console.log("Send complete");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await escalationApi.updateStatus(ticketId, newStatus);
      console.log("Status updated successfully");

      // Optimistic update - update status immediately
      if (response.ticket) {
        setTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: response.ticket.status,
            resolved_at: response.ticket.resolved_at || prev.resolved_at,
            superadmin_id: response.ticket.superadmin_id || prev.superadmin_id,
          };
        });
      }

      // No need to reload - broadcasting will update for other users
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
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
    return `http://127.0.0.1:8000${attachment.startsWith("/") ? "" : "/"}${attachment}`;
  };

  const renderAttachments = (urls: string[] | null | undefined) => {
    if (!urls || urls.length === 0) return null;

    return (
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {urls.map((url, index) => {
          const attachmentUrl = getAttachmentUrl(url);
          const isImage = url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
          const fileName = url.split("/").pop();

          if (isImage) {
            return (
              <a
                key={index}
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={attachmentUrl}
                  alt="Attachment"
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </a>
            );
          }

          return (
            <a
              key={index}
              href={attachmentUrl}
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
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-slate-400">
                {ticket.ticket_number}
              </span>
              <Badge className={priorityColors[ticket.priority]}>
                {ticket.priority.toUpperCase()}
              </Badge>
              <Badge className={statusColors[ticket.status]}>
                {statusLabels[ticket.status]}
              </Badge>
              {ticket.type === "escalation" && (
                <Badge className="bg-amber-100 text-amber-700">
                  🔼 Eskalasi
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {ticket.subject}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dari: <span className="font-medium">{ticket.admin?.name}</span> (
              {ticket.admin?.email})
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Support Ticket History (if escalation) - READ ONLY */}
          {ticket.type === "escalation" && ticket.support_ticket && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20 overflow-hidden">
              <div className="bg-amber-100 dark:bg-amber-800/50 px-4 py-3 border-b border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-800 dark:text-amber-300">
                    📋 History Tiket Asli: {ticket.support_ticket.ticket_number}
                  </span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  {ticket.support_ticket.subject}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-3 w-3" />
                  Anda hanya bisa melihat, tidak bisa membalas langsung ke user
                </p>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto space-y-3">
                {/* User info */}
                {ticket.support_ticket.user && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-600 mb-1">
                      User yang mengalami kendala:
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                        {ticket.support_ticket.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {ticket.support_ticket.user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ticket.support_ticket.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Original Ticket Description (First Message) */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-medium text-white">
                      {ticket.support_ticket.user?.name.charAt(0) || "U"}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {ticket.support_ticket.user?.name || "User"}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                    >
                      Pelaporan Awal
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatDate(ticket.support_ticket.created_at)}
                    </span>
                  </div>
                  <div className="pl-8">
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {ticket.support_ticket.description}
                    </p>
                    {ticket.support_ticket.attachments &&
                      ticket.support_ticket.attachments.length > 0 && (
                        <div className="mt-2">
                          {renderAttachments(ticket.support_ticket.attachments)}
                        </div>
                      )}
                  </div>
                </div>

                {/* Conversation history (Replies) */}
                {ticket.support_ticket.replies?.map((reply, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          reply.is_admin_reply
                            ? "bg-gradient-to-br from-pln-primary to-pln-light text-white"
                            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        }`}
                      >
                        {reply.user?.name.charAt(0) || "?"}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {reply.user?.name || "Unknown"}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          reply.is_admin_reply
                            ? "bg-pln-100 text-pln-700 border-pln-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {reply.is_admin_reply ? "Admin" : "User"}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <div className="pl-8">
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {reply.message}
                      </p>
                      {reply.attachments &&
                        renderAttachments(reply.attachments)}
                    </div>
                  </div>
                ))}
                {(!ticket.support_ticket.replies ||
                  ticket.support_ticket.replies.length === 0) && (
                  <p className="text-sm text-amber-600 italic text-center py-2">
                    Belum ada balasan di tiket asli
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Escalation Discussion with Admin */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="bg-gradient-to-r from-pln-primary to-pln-light px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="font-medium">Diskusi dengan Admin</span>
              </div>
            </div>

            {/* Initial Description (Alasan Eskalasi) */}
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
                {/* Currently EscalationTicket doesn't have initial attachments, only replies do. 
                    If needed, we can add attachments to EscalationTicket model too. */}
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
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {reply.message}
                    </p>
                    {reply.attachments && renderAttachments(reply.attachments)}
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
                onSend={(e?: any) => {
                  e?.preventDefault?.();
                  handleSendMessage(e || { preventDefault: () => {}, stopPropagation: () => {} } as any);
                }}
                onFileSelect={handleFileSelect}
                onRemoveFile={removeAttachment}
                attachments={attachments}
                previewUrls={previewUrls}
                isSubmitting={sending}
                placeholder="Ketik balasan ke Admin..."
                label="Diskusi dengan Admin"
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
                  Percakapan ini telah ditutup (Read Only).
                </p>
                <Button
                  onClick={() => router.push("/superadmin/escalations")}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Kembali ke Daftar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Info & Actions */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Aksi
            </h3>
            <div className="space-y-2">
              {ticket.status === "open" && (
                <Button
                  onClick={() => handleUpdateStatus("in_progress")}
                  disabled={updatingStatus}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  {updatingStatus ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                  )}
                  Mulai Tangani
                </Button>
              )}
              {(ticket.status === "open" ||
                ticket.status === "in_progress") && (
                <Button
                  onClick={() => handleUpdateStatus("resolved")}
                  disabled={updatingStatus}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Selesaikan
                </Button>
              )}
              {ticket.status !== "closed" && (
                <Button
                  onClick={() => handleUpdateStatus("closed")}
                  disabled={updatingStatus}
                  variant="outline"
                  className="w-full"
                >
                  Tutup Tiket
                </Button>
              )}
            </div>
          </div>

          {/* Info */}
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
                <p className="text-xs text-slate-400 mb-1">Dari Admin</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {ticket.admin?.name}
                </p>
                <p className="text-xs text-slate-500">{ticket.admin?.email}</p>
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
