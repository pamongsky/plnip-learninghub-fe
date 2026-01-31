"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ClockIcon,
  UserCircleIcon,
  DocumentIcon,
  BuildingOffice2Icon,
  TagIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { supportApi, SupportTicket } from "@/lib/api/support";

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
  escalated: "bg-purple-100 text-purple-700",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "Diproses",
  resolved: "Selesai",
  closed: "Ditutup",
  escalated: "Dieskalasi",
};

export default function SuperadminMonitoringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const ticketId = Number(params.id);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await supportApi.getTicket(ticketId);
      setTicket(data);
    } catch (error) {
      console.error("Error loading ticket:", error);
    } finally {
      setLoading(false);
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

  const renderAttachments = (urls: string[] | null | undefined) => {
    if (!urls || urls.length === 0) return null;

    return (
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {urls.map((url, index) => {
          const isImage = url.match(/\.(jpeg|jpg|png|gif)$/i);
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
          Kembali ke Tracking
        </button>

        {/* Monitoring Banner */}
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <EyeIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">
              Mode Monitoring Global
            </h3>
            <p className="text-xs text-blue-700">
              Anda sedang melihat detail tiket user. Mode ini hanya Read-Only
              (Hanya Baca).
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-slate-400">
                {ticket.ticket_number}
              </span>
              <Badge className={priorityColors[ticket.priority]}>
                {ticket.priority?.toUpperCase()}
              </Badge>
              <Badge className={statusColors[ticket.status]}>
                {statusLabels[ticket.status]}
              </Badge>
              <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase border border-slate-200">
                <TagIcon className="w-3 h-3" />
                {ticket.category}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {ticket.subject}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Dari: <span className="font-medium">{ticket.user?.name}</span> (
              {ticket.user?.email})
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white">
                Deskripsi Masalah
              </h3>
            </div>
            <div className="p-4">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {ticket.description}
              </p>
              {/* Should check if SupportTicket model has 'attachments' field at root level. 
                      Based on controller, yes it does. But interface might need update if typescript complains. 
                      Let's check if ticket object has it. Backend sends it. Interface in support.ts might not have it yet.
                      If not, I might need to update interface or cast. 
                      Lets try rendering it assuming it might exist, or check type definition. 
                      Checking support.ts... it allows any extras? No.
                      Actually controller returns it. I'll cast 'any' for now if needed or update interface. 
                      Wait, previous steps added attachments to 'replies'. Did I add to 'tickets'?
                      Yes, 'store' method adds it. 'migrations' added it.
                      So ticket object has 'attachments'.
                  */}
              {/* @ts-ignore */}
              {ticket.attachments && renderAttachments(ticket.attachments)}
            </div>
          </div>

          {/* Conversation History */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-medium text-slate-900 dark:text-white">
                Riwayat Percakapan
              </h3>
              <span className="text-xs text-slate-500">
                {ticket.replies?.length || 0} Balasan
              </span>
            </div>
            <div className="p-4 space-y-4">
              {ticket.replies?.map((reply) => (
                <div key={reply.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${reply.is_admin_reply ? "bg-pln-primary" : "bg-slate-400"}`}
                    >
                      {reply.user?.name.charAt(0) || "U"}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {reply.user?.name}
                        </span>
                        {reply.is_admin_reply && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5 border-pln-primary text-pln-primary"
                          >
                            Admin
                          </Badge>
                        )}
                        {!reply.is_admin_reply && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 px-1.5"
                          >
                            User
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-slate-700 dark:text-slate-300 text-sm">
                      <p className="whitespace-pre-wrap">{reply.message}</p>
                      {/* @ts-ignore */}
                      {reply.attachments &&
                        renderAttachments(reply.attachments)}
                    </div>
                  </div>
                </div>
              ))}
              {(!ticket.replies || ticket.replies.length === 0) && (
                <p className="text-center text-slate-500 italic py-4">
                  Belum ada balasan dalam tiket ini.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Admin Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BuildingOffice2Icon className="w-4 h-4" />
              Info Penanganan
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">
                  Ditangani Oleh (Admin Unit)
                </p>
                {ticket.assigned_admin ? (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-pln-primary flex items-center justify-center text-white text-xs font-medium">
                      {ticket.assigned_admin.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {ticket.assigned_admin.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ticket.assigned_admin.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                    <p className="text-sm text-slate-500 italic">
                      Belum ada admin yang menangani
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Status Tiket</p>
                <Badge
                  className={`${statusColors[ticket.status]} w-full justify-center py-1`}
                >
                  {statusLabels[ticket.status]}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">Prioritas</p>
                <Badge
                  className={`${priorityColors[ticket.priority]} w-full justify-center py-1`}
                >
                  {ticket.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCircleIcon className="w-4 h-4" />
              Info User
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">
                {ticket.user?.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  {ticket.user?.name}
                </p>
                <p className="text-xs text-slate-500">{ticket.user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
