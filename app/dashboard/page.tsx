'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface QuickStat {
  title: string;
  value: number;
  icon: string;
  color: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  published_at: string;
  creator: {
    name: string;
    department: string;
  };
}

interface DashboardData {
  user: {
    name: string;
    email: string;
    employee_id: string;
    department: string;
    position: string;
  };
  stats: {
    total_courses: number;
    completed_courses: number;
    in_progress_courses: number;
    certificates_earned: number;
    total_learning_hours: number;
    completion_rate: number;
  };
  quick_stats: QuickStat[];
  announcements: Announcement[];
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/employee');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'book-open':
        return BookOpenIcon;
      case 'check-circle':
        return CheckCircleIcon;
      case 'clock':
        return ClockIcon;
      case 'award':
        return TrophyIcon;
      default:
        return BookOpenIcon;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-600';
      case 'purple':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pln-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-pln-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PLN IP Learning Hub</h1>
                <p className="text-sm text-gray-500">Employee Portal</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{dashboardData?.user.position}</p>
                </div>
                <UserCircleIcon className="w-10 h-10 text-gray-400" />
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {dashboardData?.user.name}!
          </h2>
          <p className="text-gray-600 mt-1">
            {dashboardData?.user.department} • {dashboardData?.user.employee_id}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData?.quick_stats.map((stat, index) => {
            const IconComponent = getIconComponent(stat.icon);
            const colorClasses = getColorClasses(stat.color);

            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Announcements */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Latest Announcements</h3>
                <button className="text-sm text-pln-primary hover:text-pln-600 flex items-center">
                  View all
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </button>
              </div>

              {dashboardData?.announcements && dashboardData.announcements.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-pln-primary transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded ${
                          announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                          announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{announcement.creator?.name || 'Admin'}</span>
                        <span className="mx-2">•</span>
                        <span>{announcement.creator?.department || 'HCIS'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(announcement.published_at || announcement.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No announcements yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Learning Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Overall Completion</span>
                    <span className="text-sm font-medium text-gray-900">
                      {dashboardData?.stats.completion_rate || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pln-primary h-2 rounded-full transition-all"
                      style={{ width: `${dashboardData?.stats.completion_rate || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center py-8">
                    <BookOpenIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">No active courses yet</p>
                    <button className="px-4 py-2 bg-pln-primary text-white rounded-lg text-sm hover:bg-pln-600 transition">
                      Browse Courses
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Browse Courses
                </button>
                <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center">
                  <TrophyIcon className="w-5 h-5 mr-3 text-gray-400" />
                  My Certificates
                </button>
                <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
