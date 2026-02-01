"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import DirectMessageChat from "@/components/chat/DirectMessageChat";
import { messagesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function InstructorMessagesPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    total_conversations: 0,
    unread_messages: 0,
    active_today: 0,
    total_messages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    messagesApi
      .getStats()
      .then((data) => {
        if (!isMounted) return;
        setStats({
          total_conversations: data.total_conversations ?? 0,
          unread_messages: data.unread_messages ?? 0,
          active_today: data.active_today ?? 0,
          total_messages: data.total_messages ?? 0,
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(
          error?.response?.data?.message || "Gagal memuat statistik pesan",
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loading, user]);

  const currentUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roles?.[0] || "instructor",
      avatar: user.avatar || undefined,
    };
  }, [user]);

  const statsCards = useMemo(
    () => [
      {
        title: "Total Percakapan",
        value: stats.total_conversations,
        icon: ChatBubbleLeftRightIcon,
        color: "from-pln-primary to-pln-light",
        bgColor: "bg-blue-50",
      },
      {
        title: "Pesan Belum Dibaca",
        value: stats.unread_messages,
        icon: EnvelopeIcon,
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-50",
      },
      {
        title: "Aktif Hari Ini",
        value: stats.active_today,
        icon: ClockIcon,
        color: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-50",
      },
    ],
    [stats],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6">
        <div className="mb-6">
          <div className="h-8 w-40 rounded bg-slate-200 animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-900">Pesan ke Admin</h1>
        <p className="mt-1 text-slate-500">
          Komunikasi dengan admin untuk koordinasi kelas dan kebutuhan lainnya
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 rounded-xl bg-gradient-to-r from-pln-primary/10 to-pln-light/10 p-4"
      >
        <p className="text-sm text-slate-600">
          💡 Gunakan fitur ini untuk berkomunikasi dengan admin terkait jadwal
          kelas, perubahan materi, atau kendala teknis. Untuk diskusi dengan
          peserta, gunakan fitur <strong>Chat Kelas</strong> di halaman detail
          kelas.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-2xl ${stat.bgColor} p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {stat.title}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {isLoading ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200" />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
                {React.createElement(stat.icon, {
                  className: "h-6 w-6 text-white",
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="h-[calc(100vh-380px)] min-h-[500px]"
      >
        {errorMessage ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            {errorMessage}
          </div>
        ) : currentUser ? (
          <DirectMessageChat currentUser={currentUser} />
        ) : null}
      </motion.div>
    </div>
  );
}
