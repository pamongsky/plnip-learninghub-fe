"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { getStorageUrl, getPriorityColor } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface Creator {
  id: number;
  name: string;
  department: string;
  position: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  image: string | null;
  priority: "high" | "medium" | "low";
  published_at: string | null;
  created_at: string;
  creator: Creator | null;
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchAnnouncement(params.id as string);
    }
  }, [params?.id]);

  const fetchAnnouncement = async (id: string) => {
    try {
      const response = await api.get(`/announcements/${id}`);
      setAnnouncement(response.data.data.announcement);
    } catch (error) {
      console.error("Failed to fetch announcement:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="border-t border-b border-gray-100 py-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="w-full h-64 md:h-96 bg-gray-200"></div>
            <div className="p-8 md:p-10 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pengumuman tidak ditemukan
        </h2>
        <Link
          href="/announcements"
          className="text-pln-primary hover:underline flex items-center"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Kembali ke daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Banner */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/announcements"
            className="inline-flex items-center text-sm text-gray-500 hover:text-pln-primary mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Kembali ke Papan Pengumuman
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wide ${getPriorityColor(
                announcement.priority,
              )}`}
            >
              {announcement.priority}
            </span>
            <span className="text-gray-400 text-sm flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {new Date(announcement.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {announcement.title}
          </h1>

          <div className="flex items-center border-t border-b border-gray-100 py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <UserCircleIcon className="w-6 h-6" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {announcement.creator?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">
                  {announcement.creator?.department || "PLN Indonesia Power"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {announcement.image && (
            <div className="w-full h-64 md:h-96 relative">
              <img
                src={getStorageUrl(announcement.image) || ''}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-10">
            <div
              className="prose prose-lg max-w-none text-gray-700 prose-headings:text-pln-primary prose-a:text-pln-primary"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
