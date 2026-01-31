"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  TrophyIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Mock data
const certificates = [
  {
    id: 1,
    title: "Dasar-Dasar Pembangkit Listrik",
    issueDate: "15 Januari 2025",
    expiryDate: null,
    credentialId: "PLN-CERT-2025-001234",
    category: "Pembangkit",
    status: "valid",
    instructor: "Dr. Ahmad Wijaya",
    hours: 8,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Keselamatan Kerja (K3)",
    issueDate: "20 Desember 2024",
    expiryDate: "20 Desember 2025",
    credentialId: "PLN-CERT-2024-K3-0567",
    category: "Safety",
    status: "valid",
    instructor: "Ir. Siti Rahma",
    hours: 4,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Energi Terbarukan",
    issueDate: "05 November 2024",
    expiryDate: null,
    credentialId: "PLN-CERT-2024-GE-0890",
    category: "Green Energy",
    status: "valid",
    instructor: "Dr. Maya Putri",
    hours: 10,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Manajemen Proyek PLTU",
    issueDate: "10 September 2024",
    expiryDate: "10 September 2025",
    credentialId: "PLN-CERT-2024-PM-0432",
    category: "Management",
    status: "expiring_soon",
    instructor: "Ir. Hendra Gunawan",
    hours: 12,
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
  },
];

const categoryFilters = ["Semua", "Pembangkit", "Safety", "Green Energy", "Management", "Transmisi"];

export default function CertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.credentialId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || cert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded">
            <CheckBadgeIcon className="w-3 h-3" />
            Valid
          </span>
        );
      case "expiring_soon":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
            <CalendarIcon className="w-3 h-3" />
            Segera Kedaluwarsa
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
            Kedaluwarsa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Sertifikat</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kumpulan sertifikat yang telah Anda peroleh</p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total Sertifikat", value: certificates.length, icon: AcademicCapIcon, color: "text-pln-primary bg-pln-primary/10" },
          { label: "Jam Belajar", value: certificates.reduce((acc, c) => acc + c.hours, 0), icon: TrophyIcon, color: "text-amber-600 bg-amber-50" },
          { label: "Kategori", value: new Set(certificates.map(c => c.category)).size, icon: DocumentTextIcon, color: "text-purple-600 bg-purple-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari sertifikat atau credential ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-pln-primary/20 focus:border-pln-primary transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                selectedCategory === cat
                  ? "bg-pln-primary text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Certificates Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <AcademicCapIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Tidak ada sertifikat ditemukan</p>
            <p className="text-sm text-slate-400 mt-1">Selesaikan kursus untuk mendapatkan sertifikat</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredCertificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Certificate Preview */}
                <div className="relative bg-gradient-to-br from-pln-primary via-pln-light to-cyan-500 p-6 text-white">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                      </pattern>
                      <rect width="100" height="100" fill="url(#grid)"/>
                    </svg>
                  </div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AcademicCapIcon className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider opacity-80">Sertifikat Penyelesaian</p>
                    <h3 className="font-bold text-sm mt-1 line-clamp-1">{cert.title}</h3>
                    <p className="text-[10px] opacity-80 mt-1">Instruktur: {cert.instructor}</p>
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(cert.status)}
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-medium text-pln-primary bg-pln-primary/10 px-2 py-0.5 rounded">
                      {cert.category}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{cert.hours} jam</span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Credential ID</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 text-[10px]">{cert.credentialId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Diterbitkan</span>
                      <span className="text-slate-700 dark:text-slate-300">{cert.issueDate}</span>
                    </div>
                    {cert.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Berlaku sampai</span>
                        <span className={`${cert.status === "expiring_soon" ? "text-amber-600 font-medium" : "text-slate-700 dark:text-slate-300"}`}>
                          {cert.expiryDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-pln-primary text-white rounded-lg text-xs font-medium hover:bg-pln-dark transition-all">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Unduh
                    </button>
                    <button className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Verification Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckBadgeIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h4 className="font-medium text-slate-800 dark:text-white text-sm">Verifikasi Sertifikat</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Semua sertifikat dapat diverifikasi melalui Credential ID di portal PLN IP Learning Hub.
              Bagikan sertifikat Anda ke LinkedIn atau platform profesional lainnya.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
