"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PlusIcon,
  ClockIcon,
  TrashIcon,
  ChevronLeftIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import {
  aiAssistantApi,
  type AIContext,
  type AIChatMessage,
  type AISession,
} from "@/lib/api/ai-assistant";

// Chatbot icon SVG
function BotIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="3"
        y="7"
        width="18"
        height="12"
        rx="3"
        fill="currentColor"
        opacity="0.15"
      />
      <rect
        x="3"
        y="7"
        width="18"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="9" cy="13" r="1.5" fill="currentColor" />
      <circle cx="15" cy="13" r="1.5" fill="currentColor" />
      <path
        d="M12 2v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
    </svg>
  );
}

// Bot avatar with chatbot icon
function BotAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const config = {
    sm: { box: "h-6 w-6", icon: "h-3.5 w-3.5" },
    md: { box: "h-8 w-8", icon: "h-4.5 w-4.5" },
    lg: { box: "h-14 w-14", icon: "h-8 w-8" },
  };
  return (
    <div
      className={`${config[size].box} rounded-lg bg-pln-primary flex items-center justify-center text-white flex-shrink-0`}
    >
      <BotIcon className={config[size].icon} />
    </div>
  );
}

// Simple markdown rendering
function renderMessage(content: string) {
  let html = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^[•\-]\s(.+)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/\n/g, "<br />");
  return html;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AIContext | null>(null);
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isNewChat, setIsNewChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && !context) {
      loadContext();
    }
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isMaximized) setShowSidebar(true);
  }, [isMaximized]);

  const loadContext = async () => {
    try {
      const ctx = await aiAssistantApi.getContext();
      setContext(ctx);
    } catch (error) {
      console.error("Failed to load AI context:", error);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await aiAssistantApi.getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setIsNewChat(true);
    setMessages([]);
    setShowSidebar(false);
    inputRef.current?.focus();
  };

  const loadConversation = async (session: AISession) => {
    try {
      setIsLoading(true);
      const history = await aiAssistantApi.getHistory(session.conversation_id);
      setMessages(history);
      setConversationId(session.conversation_id);
      setIsNewChat(false);
      setShowSidebar(false);
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (
    e: React.MouseEvent,
    sessionConvId: string,
  ) => {
    e.stopPropagation();
    try {
      await aiAssistantApi.deleteSession(sessionConvId);
      setSessions((prev) =>
        prev.filter((s) => s.conversation_id !== sessionConvId),
      );
      if (conversationId === sessionConvId) startNewChat();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      let activeConvId = conversationId;
      if (!activeConvId) {
        activeConvId = `conv-${Date.now()}${Math.random().toString(36).slice(2)}`;
        setConversationId(activeConvId);
        setIsNewChat(false);
      }

      const response = await aiAssistantApi.chat(currentInput, activeConvId);

      const assistantMessage: AIChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      loadSessions();
    } catch {
      const errorMessage: AIChatMessage = {
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Bagaimana cara membuat tiket support?",
    "Bagaimana cara mengakses kelas saya?",
    "Jelaskan materi yang ada di kelas saya",
    "Apa saja fitur yang tersedia?",
  ];

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins}m lalu`;
      if (diffHours < 24) return `${diffHours}j lalu`;
      if (diffDays < 7) return `${diffDays}h lalu`;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  // Welcome screen
  const WelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <BotAvatar size="lg" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-1">
        PLN IP Assistant
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        Tanya apa saja tentang materi pembelajaran, navigasi platform, atau
        pertanyaan umum lainnya.
      </p>
      <div className="w-full space-y-2 max-w-xs">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputMessage(q);
              inputRef.current?.focus();
            }}
            className="w-full text-left text-sm px-4 py-2.5 rounded-lg bg-pln-50 dark:bg-slate-700/50 hover:bg-pln-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 border border-pln-100 dark:border-slate-600"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );

  // Sidebar
  const Sidebar = () => (
    <div className="flex flex-col h-full bg-pln-50/50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={startNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-pln-primary text-white text-sm font-medium hover:bg-pln-dark transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Chat Baru
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sessionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 border-2 border-pln-200 border-t-pln-primary rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 px-3">
            <ClockIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Belum ada riwayat
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.conversation_id}
              onClick={() => loadConversation(session)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  loadConversation(session);
                }
              }}
              role="button"
              tabIndex={0}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group relative cursor-pointer ${
                conversationId === session.conversation_id
                  ? "bg-pln-primary/10 text-pln-primary dark:bg-pln-primary/20 dark:text-pln-light"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <p className="truncate pr-6 text-xs font-medium">
                {session.title}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {formatTime(session.last_message_at)}
              </p>
              <button
                onClick={(e) => deleteConversation(e, session.conversation_id)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
              >
                <TrashIcon className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Button - clean corporate */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 rounded-xl bg-pln-primary p-3.5 text-white shadow-lg hover:bg-pln-dark hover:shadow-xl transition-all ${
          isOpen ? "hidden" : "block"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BotIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 rounded-xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 flex overflow-hidden transition-all duration-300 ${
              isMaximized
                ? "inset-4 w-auto h-auto"
                : "bottom-6 right-6 w-[400px] h-[580px]"
            }`}
          >
            {/* Sidebar */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: isMaximized ? 260 : 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-hidden flex-shrink-0"
                >
                  <Sidebar />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="bg-pln-primary p-3 text-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="rounded-lg p-1.5 hover:bg-white/15 transition-colors flex-shrink-0"
                  >
                    {showSidebar ? (
                      <ChevronLeftIcon className="h-4 w-4" />
                    ) : (
                      <Bars3Icon className="h-4 w-4" />
                    )}
                  </button>
                  <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <BotIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm leading-tight">
                      PLN IP Assistant
                    </h3>
                    <p className="text-[10px] text-white/60">
                      {isNewChat
                        ? "Percakapan baru"
                        : `${messages.length} pesan`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={startNewChat}
                    className="rounded-lg p-1.5 hover:bg-white/15 transition-colors"
                    title="Chat Baru"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="rounded-lg p-1.5 hover:bg-white/15 transition-colors"
                    title={isMaximized ? "Perkecil" : "Perbesar"}
                  >
                    {isMaximized ? (
                      <ArrowsPointingInIcon className="h-4 w-4" />
                    ) : (
                      <ArrowsPointingOutIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowSidebar(false);
                    }}
                    className="rounded-lg p-1.5 hover:bg-white/15 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              {messages.length === 0 && !isLoading ? (
                <WelcomeScreen />
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && <BotAvatar size="sm" />}
                      <div
                        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${
                          message.role === "user"
                            ? "bg-pln-primary text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <div
                          className="text-sm whitespace-pre-wrap leading-relaxed [&_strong]:font-semibold [&_li]:list-disc"
                          dangerouslySetInnerHTML={{
                            __html: renderMessage(message.content),
                          }}
                        />
                        <p
                          className={`text-[10px] mt-1 ${
                            message.role === "user"
                              ? "text-white/40"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <BotAvatar size="sm" />
                      <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-3">
                        <div className="flex gap-1.5">
                          <div
                            className="h-1.5 w-1.5 rounded-full bg-pln-primary/60 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="h-1.5 w-1.5 rounded-full bg-pln-primary/60 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="h-1.5 w-1.5 rounded-full bg-pln-primary/60 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Input */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex-shrink-0">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pertanyaan..."
                    className="flex-1 resize-none rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pln-primary dark:text-white"
                    rows={1}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="self-end rounded-lg bg-pln-primary px-3 py-2 text-white hover:bg-pln-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
