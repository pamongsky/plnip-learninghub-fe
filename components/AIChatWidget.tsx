"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { aiAssistantApi, type AIContext, type AIChatMessage } from "@/lib/api/ai-assistant";

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AIContext | null>(null);
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load AI context when widget opens
  useEffect(() => {
    if (isOpen && !context) {
      loadContext();
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadContext = async () => {
    try {
      const ctx = await aiAssistantApi.getContext();
      setContext(ctx);
      
      // Add welcome message with user's name and available features
      const features = ctx.available_features.map(f => `• ${f.name}: ${f.description}`).join('\n');
      
      setMessages([
        {
          role: "assistant",
          content: `Halo ${ctx.user_info.name}! 👋\n\nSaya AI Assistant untuk PLN IP Learning Hub. Saya sudah melihat menu dan fitur yang tersedia untuk Anda.\n\n**Fitur yang bisa Anda gunakan:**\n${features}\n\n💬 Saya bisa bantu jelaskan cara menggunakan fitur-fitur di atas dengan detail, step-by-step!\n\nAda yang ingin ditanyakan?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to load AI context:", error);
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
    setInputMessage("");
    setIsLoading(true);

    try {
      console.log('=== SENDING TO AI ASSISTANT ===');
      console.log('Input message:', inputMessage);
      console.log('Calling aiAssistantApi.chat()');
      
      const response = await aiAssistantApi.chat(inputMessage, conversationId);
      
      console.log('=== AI RESPONSE RECEIVED ===');
      console.log('Full response:', response);
      console.log('Response text:', response.response);
      console.log('Timestamp:', response.timestamp);
      
      if (!response.response) {
        console.error('ERROR: No response.response field!');
        throw new Error('Empty AI response');
      }
      
      const assistantMessage: AIChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: response.timestamp,
      };

      console.log('Adding assistant message to state:', assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("=== AI CHAT ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      
      const errorMessage: AIChatMessage = {
        role: "assistant",
        content: `Maaf, terjadi kesalahan: ${error.message || 'Unknown error'}. Silakan coba lagi atau buat tiket support.`,
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
    "Bagaimana cara download sertifikat?",
    "Apa saja fitur yang tersedia?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-br from-pln-primary to-blue-600 p-4 text-white shadow-lg hover:shadow-xl transition-all ${
          isOpen ? "hidden" : "block"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
          <SparklesIcon className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pln-primary to-blue-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-xs text-white/80">Selalu siap membantu</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-pln-primary text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-white/60"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Questions */}
              {messages.length === 1 && !isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <LightBulbIcon className="h-4 w-4" />
                    <span>Pertanyaan cepat:</span>
                  </div>
                  {quickQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left text-sm px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="flex gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pertanyaan Anda..."
                  className="flex-1 resize-none rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pln-primary dark:text-white"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="self-end rounded-xl bg-pln-primary px-4 py-2 text-white hover:bg-pln-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                💡 AI bisa membantu navigasi platform, bukan code/database
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
