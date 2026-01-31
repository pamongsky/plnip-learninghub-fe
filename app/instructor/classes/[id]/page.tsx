"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import ClassGroupChat from "@/components/chat/ClassGroupChat";

// Mock class data
const classData = {
  id: "1",
  title: "Dasar-Dasar Pembangkit Listrik",
  description: "Memahami prinsip dasar pembangkitan listrik dan komponen utama pembangkit",
  schedule: "Senin & Rabu, 09:00 - 11:00",
  startDate: "15 Januari 2026",
  endDate: "15 Maret 2026",
  totalSessions: 24,
  completedSessions: 11,
  moodleUrl: "#",
};

// Mock participants
const participantsData = [
  { id: "p1", name: "Muhammad Fahmi", email: "m.fahmi@pln.co.id", department: "Unit Pembangkit Suralaya", lastActive: "Hari ini", progress: 85, status: "active" },
  { id: "p2", name: "Alya Putri Ramadhani", email: "alya.putri@pln.co.id", department: "Unit Transmisi Jawa Barat", lastActive: "Kemarin", progress: 72, status: "active" },
  { id: "p3", name: "Rizky Akbar Pratama", email: "rizky.akbar@pln.co.id", department: "Unit Distribusi Jakarta", lastActive: "3 hari lalu", progress: 68, status: "active" },
  { id: "p4", name: "Dewi Kartika Sari", email: "dewi.kartika@pln.co.id", department: "Unit Pembangkit Paiton", lastActive: "1 minggu lalu", progress: 45, status: "inactive" },
  { id: "p5", name: "Budi Santoso", email: "budi.santoso@pln.co.id", department: "Unit Transmisi Sumatra", lastActive: "2 minggu lalu", progress: 30, status: "inactive" },
  { id: "p6", name: "Siti Nurhaliza", email: "siti.nurhaliza@pln.co.id", department: "Unit Distribusi Bandung", lastActive: "Hari ini", progress: 90, status: "active" },
];

export default function InstructorClassDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [unansweredQuestions, setUnansweredQuestions] = useState(0);

  // Unanswered questions count is now updated by ClassGroupChat via onQuestionCountChange callback

  const filteredParticipants = participantsData.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = participantsData.filter(p => p.status === "active").length;
  const inactiveCount = participantsData.filter(p => p.status === "inactive").length;
  const avgProgress = Math.round(participantsData.reduce((acc, p) => acc + p.progress, 0) / participantsData.length);

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/instructor/classes"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-pln-primary dark:hover:text-pln-light mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali ke Daftar Kelas
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{classData.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{classData.description}</p>
          </div>
          <a
            href={classData.moodleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pln-primary to-pln-light text-white rounded-xl font-medium hover:shadow-lg hover:shadow-pln-primary/25 transition-all"
          >
            <PlayCircleIcon className="w-5 h-5" />
            Buka di Moodle
          </a>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "overview"
                ? "bg-pln-primary text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <InformationCircleIcon className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 relative ${
              activeTab === "chat"
                ? "bg-pln-primary text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            Chat Grup
            {unansweredQuestions > 0 && (
              <span 
                className="absolute -top-3 -right-3 bg-red-600 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold border-3 border-white dark:border-slate-800 shadow-lg animate-pulse cursor-pointer hover:bg-red-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("chat");
                  // Could add logic to scroll to first unanswered question
                }}
                title={`${unansweredQuestions} pertanyaan belum dijawab`}
              >
                {unansweredQuestions}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Class Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pln-primary/10 dark:bg-pln-primary/20 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-pln-primary dark:text-pln-light" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{participantsData.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Peserta</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{activeCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Peserta Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{inactiveCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tidak Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{avgProgress}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rata-rata Progress</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Schedule Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-r from-pln-primary to-pln-light rounded-xl p-4 text-white"
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-white/70" />
            <div>
              <p className="text-xs text-white/70">Periode</p>
              <p className="font-medium text-sm">{classData.startDate} - {classData.endDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-white/70" />
            <div>
              <p className="text-xs text-white/70">Jadwal</p>
              <p className="font-medium text-sm">{classData.schedule}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-white/70" />
            <div>
              <p className="text-xs text-white/70">Sesi</p>
              <p className="font-medium text-sm">{classData.completedSessions}/{classData.totalSessions} selesai</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Participants Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white">Daftar Peserta</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kelola dan pantau peserta kelas</p>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>

        {/* Participants Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">Peserta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hidden sm:table-cell">Terakhir Aktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {participant.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{participant.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{participant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{participant.department}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                      participant.status === "active" 
                        ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                    }`}>
                      {participant.status === "active" ? (
                        <><CheckCircleIcon className="w-3 h-3" /> Aktif</>
                      ) : (
                        <><XCircleIcon className="w-3 h-3" /> Tidak Aktif</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            participant.progress >= 70 ? "bg-pln-primary" :
                            participant.progress >= 40 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${participant.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{participant.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{participant.lastActive}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada peserta ditemukan</p>
          </div>
        )}
      </motion.div>
          </>
      )}

      {/* Tab Content - Chat */}
      {activeTab === "chat" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-pln-primary" />
              Diskusi Kelas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Chat grup dengan peserta - {unansweredQuestions} pertanyaan belum dijawab
            </p>
          </div>
          <div className="h-[600px] overflow-hidden">
            <ClassGroupChat
              classId={parseInt(params.id as string)}
              currentUserId={1}
              isInstructor={true}
              onQuestionCountChange={setUnansweredQuestions}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
