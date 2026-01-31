"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import ClassGroupChat from "@/components/chat/ClassGroupChat";

// Mock class data
const classData = {
  id: "1",
  title: "Dasar-Dasar Pembangkit Listrik",
  description: "Memahami prinsip dasar pembangkitan listrik dan komponen utama pembangkit",
  instructor: "Dr. Ahmad Wijaya",
};

export default function UserClassChatPage() {
  const params = useParams();

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
              Chat Grup: {classData.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Diskusi dengan instruktur dan peserta kelas lainnya
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chat Component */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="h-[800px]"
      >
        <ClassGroupChat
          classId={parseInt(params.id as string)}
          currentUserId={2} // Mock user ID
          isInstructor={false}
        />
      </motion.div>
    </div>
  );
}