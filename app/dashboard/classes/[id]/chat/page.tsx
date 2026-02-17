"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import ClassGroupChat from "@/components/chat/ClassGroupChat";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

interface ClassData {
  id: number;
  title: string;
  description?: string | null;
  instructor?: { name?: string | null } | null;
}

export default function UserClassChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/courses/${params.id}`);
        setClassData(res.data);
      } catch (error) {
        setClassData(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClass();
    }
  }, [params.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/dashboard/classes"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-pln-primary dark:hover:text-pln-light mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali ke Kelas Saya
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white flex-shrink-0">
            <AcademicCapIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              {loading
                ? "Memuat kelas..."
                : `Chat Grup: ${classData?.title || "Kelas"}`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {classData?.instructor?.name
                ? `Instruktur: ${classData.instructor.name}`
                : "Discussion with instructor and other learners"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chat Component */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="h-[600px] overflow-hidden"
      >
        {!loading && classData && (
          <ClassGroupChat
            classId={parseInt(params.id as string)}
            currentUserId={user?.id || 0}
            isInstructor={false}
          />
        )}
        {!loading && !classData && (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Kelas tidak ditemukan.
          </div>
        )}
      </motion.div>
    </div>
  );
}
