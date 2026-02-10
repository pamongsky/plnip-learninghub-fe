"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  BarChart3,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  answer_short: string;
  confidence_score: number;
  usage_count: number;
  success_count: number;
  failure_count: number;
  success_rate: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total_faqs: number;
  active_faqs: number;
  verified_faqs: number;
  pending_suggestions: number;
  total_usage: number;
  avg_confidence: number;
  by_category: Array<{ category: string; count: number }>;
  top_used: FAQ[];
}

interface Suggestion {
  id: number;
  question: string;
  answer: string;
  occurrence_count: number;
  status: string;
  created_at: string;
}

export default function AIFAQsPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "faqs" | "suggestions" | "analytics"
  >("faqs");
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [reviewingSuggestion, setReviewingSuggestion] =
    useState<Suggestion | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterActive, setFilterActive] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    category: "general",
    question: "",
    question_variations: [] as string[],
    answer: "",
    answer_short: "",
    confidence_score: 70,
    is_active: true,
    is_verified: false,
  });

  useEffect(() => {
    loadData();
  }, [filterCategory, filterActive, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [faqsRes, statsRes, suggestionsRes] = await Promise.all([
        api.get("/admin/ai-faqs", {
          params: {
            category: filterCategory !== "all" ? filterCategory : undefined,
            is_active:
              filterActive !== "all" ? filterActive === "active" : undefined,
            search: searchQuery || undefined,
          },
        }),
        api.get("/admin/ai-faqs/statistics"),
        api.get("/admin/ai-faqs/suggestions/list", {
          params: { status: "pending" },
        }),
      ]);

      setFaqs(faqsRes.data.data);
      setStats(statsRes.data);
      setSuggestions(suggestionsRes.data.data);
    } catch (error) {
      console.error("Failed to load FAQ data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFaq = async () => {
    try {
      if (editingFaq) {
        await api.put(`/admin/ai-faqs/${editingFaq.id}`, formData);
      } else {
        await api.post("/admin/ai-faqs", formData);
      }
      setShowFaqModal(false);
      setEditingFaq(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Failed to save FAQ:", error);
      toast.error("Gagal menyimpan FAQ");
    }
  };

  const handleDeleteFaq = async (id: number) => {
    const confirmed = await confirm({ title: "Hapus FAQ", description: "Yakin ingin menghapus FAQ ini?", confirmText: "Ya, Hapus", variant: "destructive" });
    if (!confirmed) return;
    try {
      await api.delete(`/admin/ai-faqs/${id}`);
      loadData();
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await api.post("/admin/ai-faqs/bulk-toggle", {
        ids: [id],
        is_active: !isActive,
      });
      loadData();
    } catch (error) {
      console.error("Failed to toggle FAQ:", error);
    }
  };

  const handleApproveSuggestion = async (suggestion: Suggestion) => {
    try {
      await api.post(`/admin/ai-faqs/suggestions/${suggestion.id}/approve`, {
        category: formData.category,
        question: formData.question || suggestion.question,
        answer: formData.answer || suggestion.answer,
      });
      setShowSuggestionModal(false);
      setReviewingSuggestion(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error("Failed to approve suggestion:", error);
    }
  };

  const handleRejectSuggestion = async (id: number, notes: string) => {
    try {
      await api.post(`/admin/ai-faqs/suggestions/${id}/reject`, {
        review_notes: notes,
      });
      loadData();
    } catch (error) {
      console.error("Failed to reject suggestion:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "general",
      question: "",
      question_variations: [],
      answer: "",
      answer_short: "",
      confidence_score: 70,
      is_active: true,
      is_verified: false,
    });
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      question_variations: [],
      answer: faq.answer,
      answer_short: faq.answer_short,
      confidence_score: faq.confidence_score,
      is_active: faq.is_active,
      is_verified: faq.is_verified,
    });
    setShowFaqModal(true);
  };

  const openSuggestionModal = (suggestion: Suggestion) => {
    setReviewingSuggestion(suggestion);
    setFormData({
      ...formData,
      question: suggestion.question,
      answer: suggestion.answer,
      answer_short: suggestion.answer.substring(0, 200),
    });
    setShowSuggestionModal(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      login: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      course:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      technical:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      general:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading FAQ System...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 lg:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI FAQ Management
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola FAQ untuk meningkatkan respons AI Assistant
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setEditingFaq(null);
              setShowFaqModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Buat FAQ Baru
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <StatsCard
            icon={<MessageSquare className="w-6 h-6" />}
            label="Total FAQs"
            value={stats.total_faqs}
            color="indigo"
          />
          <StatsCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Active FAQs"
            value={stats.active_faqs}
            color="green"
          />
          <StatsCard
            icon={<Users className="w-6 h-6" />}
            label="Total Usage"
            value={stats.total_usage.toLocaleString()}
            color="purple"
          />
          <StatsCard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Pending Suggestions"
            value={stats.pending_suggestions}
            color="orange"
            badge={stats.pending_suggestions > 0}
          />
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          {
            key: "faqs",
            label: "FAQs",
            icon: <MessageSquare className="w-4 h-4" />,
          },
          {
            key: "suggestions",
            label: "Suggestions",
            icon: <Sparkles className="w-4 h-4" />,
            badge: suggestions.length,
          },
          {
            key: "analytics",
            label: "Analytics",
            icon: <BarChart3 className="w-4 h-4" />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors relative ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters (FAQ Tab Only) */}
      {activeTab === "faqs" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="login">Login</option>
              <option value="course">Course</option>
              <option value="technical">Technical</option>
              <option value="general">General</option>
            </select>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "faqs" && (
          <motion.div
            key="faqs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <FAQCard
                key={faq.id}
                faq={faq}
                index={index}
                onEdit={() => openEditModal(faq)}
                onDelete={() => handleDeleteFaq(faq.id)}
                onToggle={() => handleToggleActive(faq.id, faq.is_active)}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </motion.div>
        )}

        {activeTab === "suggestions" && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                index={index}
                onApprove={() => openSuggestionModal(suggestion)}
                onReject={() => {
                  const notes = prompt("Rejection notes:");
                  if (notes) handleRejectSuggestion(suggestion.id, notes);
                }}
              />
            ))}
          </motion.div>
        )}

        {activeTab === "analytics" && stats && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <AnalyticsView stats={stats} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ Modal */}
      <AnimatePresence>
        {showFaqModal && (
          <FAQModal
            isOpen={showFaqModal}
            onClose={() => {
              setShowFaqModal(false);
              setEditingFaq(null);
              resetForm();
            }}
            onSave={handleSaveFaq}
            formData={formData}
            setFormData={setFormData}
            isEditing={!!editingFaq}
          />
        )}
      </AnimatePresence>

      {/* Suggestion Approval Modal */}
      <AnimatePresence>
        {showSuggestionModal && reviewingSuggestion && (
          <SuggestionModal
            isOpen={showSuggestionModal}
            onClose={() => {
              setShowSuggestionModal(false);
              setReviewingSuggestion(null);
              resetForm();
            }}
            onApprove={() => handleApproveSuggestion(reviewingSuggestion)}
            suggestion={reviewingSuggestion}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </AnimatePresence>
      <ConfirmDialog />
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, label, value, color, badge }: any) {
  const colors: Record<string, string> = {
    indigo: "from-indigo-500 to-purple-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-red-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg relative overflow-hidden"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-10 rounded-full -mr-8 -mt-8`}
      />
      <div className="relative z-10">
        <div
          className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colors[color]} text-white mb-3`}
        >
          {icon}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      {badge && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}

// FAQ Card Component
function FAQCard({
  faq,
  index,
  onEdit,
  onDelete,
  onToggle,
  getCategoryColor,
}: any) {
  const successRate = faq.success_rate || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(faq.category)}`}
            >
              {faq.category}
            </span>
            {faq.is_verified && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {!faq.is_active && <XCircle className="w-4 h-4 text-red-500" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {faq.question}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {faq.answer_short || faq.answer}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {faq.is_active ? (
              <XCircle className="w-4 h-4 text-orange-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{faq.usage_count} uses</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{faq.confidence_score}% confidence</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4 text-green-500" />
          <span>{faq.success_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThumbsDown className="w-4 h-4 text-red-500" />
          <span>{faq.failure_count}</span>
        </div>
        {successRate > 0 && (
          <div className="ml-auto">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                successRate >= 70
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : successRate >= 40
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {successRate}% success
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Suggestion Card Component
function SuggestionCard({ suggestion, index, onApprove, onReject }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-orange-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Auto-generated • Asked {suggestion.occurrence_count} times
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {suggestion.question}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {suggestion.answer}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onApprove}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReject}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </motion.button>
      </div>
    </motion.div>
  );
}

// Analytics View Component
function AnalyticsView({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            FAQs by Category
          </h3>
          <div className="space-y-3">
            {stats.by_category.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between"
              >
                <span className="capitalize text-gray-700 dark:text-gray-300">
                  {cat.category}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{
                        width: `${(cat.count / stats.total_faqs) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {cat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Used FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top 5 Most Used FAQs
          </h3>
          <div className="space-y-3">
            {stats.top_used.map((faq, idx) => (
              <div
                key={faq.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {faq.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{faq.usage_count} uses</span>
                    <span>•</span>
                    <span>{faq.success_rate}% success</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// FAQ Modal Component
function FAQModal({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  isEditing,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {isEditing ? "Edit FAQ" : "Create New FAQ"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="general">General</option>
              <option value="login">Login</option>
              <option value="course">Course</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Question
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter the FAQ question..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Answer (Full)
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter the complete answer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Answer (Short) - Optional
            </label>
            <textarea
              value={formData.answer_short}
              onChange={(e) =>
                setFormData({ ...formData, answer_short: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Short version for quick responses..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Confidence Score: {formData.confidence_score}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.confidence_score}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confidence_score: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Active
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_verified}
                onChange={(e) =>
                  setFormData({ ...formData, is_verified: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Verified
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            {isEditing ? "Update FAQ" : "Create FAQ"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Suggestion Modal Component
function SuggestionModal({
  isOpen,
  onClose,
  onApprove,
  suggestion,
  formData,
  setFormData,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Approve FAQ Suggestion
          </h2>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            This FAQ was auto-generated by AI and has been requested{" "}
            <strong>{suggestion.occurrence_count} times</strong>. Review and
            edit before approving.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="general">General</option>
              <option value="login">Login</option>
              <option value="course">Course</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Question
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Answer
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            Approve & Create FAQ
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
