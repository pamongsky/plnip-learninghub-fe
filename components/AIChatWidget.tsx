"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PlusIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
  PaperClipIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  attachmentUrl?: string; // For images/files
  source?: "faq" | "gemini_api"; // Response source
  faqId?: number; // FAQ ID if from FAQ
  analyticId?: number; // For feedback tracking
  feedbackGiven?: boolean; // Whether user gave feedback
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "Halo! Ada yang bisa saya bantu? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "online" | "error" | "connecting"
  >("online"); // New Connection State
  const [currentTitle, setCurrentTitle] = useState("AI Assistant");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [imageModal, setImageModal] = useState<string | null>(null); // For image preview
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch History (Active Session)
  const fetchCurrentHistory = async (sessId?: number | null) => {
    try {
      const url = sessId
        ? `/chat/history?session_id=${sessId}`
        : "/chat/history";
      const res = await api.get(url);

      if (res.data.session_id) {
        setSessionId(res.data.session_id);
      }

      // Set Title if available
      if (res.data.session_title) {
        setCurrentTitle(res.data.session_title);
      } else {
        setCurrentTitle("AI Assistant");
      }

      if (res.data.messages && res.data.messages.length > 0) {
        const history = res.data.messages.map((m: any) => ({
          id: m.id.toString(),
          role: m.isUser ? "user" : "ai",
          text: m.text,
        }));
        setMessages(history);
      } else {
        // Default welcome for empty
        setMessages([
          {
            id: "welcome",
            role: "ai",
            text: "Halo! Ada yang bisa saya bantu? 😊",
          },
        ]);
        setCurrentTitle("Percakapan Baru");
      }
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  // Fetch Session List (For Sidebar or Small View)
  const fetchSessions = async () => {
    try {
      const res = await api.get("/chat/sessions");
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to load sessions", error);
    }
  };

  // On Open: Fetch Active
  useEffect(() => {
    if (isOpen) {
      // Fetch current session
      fetchCurrentHistory(sessionId);
      // Pre-fetch sessions list so it's ready
      fetchSessions();
    }
  }, [isOpen]);

  // On Expand: Fetch Sessions List
  useEffect(() => {
    if (isExpanded) {
      fetchSessions();
      setShowHistory(false); // Reset small history view when expanding
    }
  }, [isExpanded]);

  const handleSessionClick = (id: number) => {
    setSessionId(id);
    setIsLoading(true); // temporary spinner effect if needed
    fetchCurrentHistory(id).then(() => {
      setIsLoading(false);
      setShowHistory(false); // Close history view in small mode
    });
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([
      {
        id: "new",
        role: "ai",
        text: "Sesi baru dimulai. Silakan tanya apa saja! 😊",
      },
    ]);
    setShowHistory(false);
    setCurrentTitle("Percakapan Baru");
  };

  const toggleHistory = () => {
    if (!showHistory) {
      fetchSessions();
    }
    setShowHistory(!showHistory);
  };

  const handleRenameSession = async (
    id: number,
    currentTitle: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Prevent opening session

    const newTitle = window.prompt("Ganti nama percakapan:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      try {
        await api.put(`/chat/sessions/${id}`, { title: newTitle });
        fetchSessions(); // Refresh list
        if (sessionId === id) setCurrentTitle(newTitle); // Update current if active
      } catch (error) {
        console.error("Failed to rename", error);
      }
    }
  };

  const handleDeleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening session

    if (window.confirm("Hapus percakapan ini?")) {
      try {
        await api.delete(`/chat/sessions/${id}`);
        fetchSessions(); // Refresh list

        if (sessionId === id) {
          handleNewChat(); // Reset if active was deleted
        }
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && !showHistory) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isExpanded, showHistory, attachment]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB

      // Check file size
      if (file.size > maxSize) {
        alert("File terlalu besar! Maksimal 10MB");
        return;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Format file tidak didukung! Gunakan JPG, PNG, GIF, atau PDF");
        return;
      }

      // Info for PDF files
      if (file.type === "application/pdf") {
        const proceed = confirm(
          "📄 PDF akan tersimpan tapi AI tidak bisa membaca isinya.\n\n" +
            "Untuk analisa dokumen, lebih baik kirim screenshot atau ketik pertanyaan spesifik.\n\n" +
            "Lanjutkan upload?",
        );
        if (!proceed) return;
      }

      setAttachment(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    console.log("Sending message:", {
      input,
      hasAttachment: !!attachment,
      sessionId,
    });

    const tempId = Date.now().toString();

    // Use default message if only attachment is sent
    const messageText = input.trim() || (attachment ? "📎 Lampiran" : "");

    const userMsg: Message = {
      id: tempId,
      role: "user",
      text: messageText,
      attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const fileToSend = attachment;
    setAttachment(null);
    setIsLoading(true);
    setConnectionStatus("connecting"); // Set to connecting state

    try {
      const formData = new FormData();
      formData.append("message", messageText || "Lihat gambar ini");
      if (sessionId) formData.append("session_id", sessionId.toString());
      if (fileToSend) formData.append("attachment", fileToSend);

      console.log("Sending to API:", {
        message: userMsg.text,
        sessionId,
        hasFile: !!fileToSend,
      });

      const res = await api.post("/chat", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("API Response:", res.data);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: res.data.reply || res.data.message?.content || "No response",
        attachmentUrl: res.data.attachment_url,
        source: res.data.source, // 'faq' or 'gemini_api'
        faqId: res.data.faq_id,
        analyticId: res.data.analytic_id, // For feedback tracking
        feedbackGiven: false,
      };

      if (res.data.session_id) {
        const newSessionId = res.data.session_id;

        // If this was a new chat, refresh sidebar list and update ID
        if (newSessionId !== sessionId) {
          setSessionId(newSessionId);
          fetchSessions(); // Refresh list background

          // Update title to the first message or fetch again
          if (currentTitle === "Percakapan Baru") {
            setCurrentTitle(userMsg.text.substring(0, 30) + "...");
          }
        }
      }

      setMessages((prev) => [...prev, aiMsg]);
      setConnectionStatus("online"); // Success -> Green
    } catch (error: any) {
      console.error("AI Chat Error:", error);

      // Get detailed error message
      let errorMessage = "Maaf, saya sedang mengalami gangguan koneksi.";

      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;

        if (status === 422) {
          // Validation error
          if (data.errors) {
            // Laravel validation errors
            const firstError = Object.values(data.errors)[0];
            errorMessage = Array.isArray(firstError)
              ? firstError[0]
              : data.message || "Format file tidak didukung.";
          } else {
            errorMessage =
              data.message ||
              "Format file tidak didukung. Gunakan gambar (jpg, png, gif) atau PDF.";
          }
        } else if (status === 502 || status === 500) {
          errorMessage =
            data.message || "Server sedang bermasalah. Coba lagi sebentar.";
        } else if (status === 429) {
          errorMessage = "Terlalu banyak permintaan. Tunggu beberapa detik ya.";
        } else if (status === 401) {
          errorMessage = "Sesi Anda habis. Silakan login kembali.";
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage =
          "Tidak bisa terhubung ke server. Periksa koneksi internet Anda.";
      }

      setConnectionStatus("error"); // Error -> Red
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          text: errorMessage,
        },
      ]);
      // Auto-revert to online after 5 seconds to not scare user permanently
      setTimeout(() => setConnectionStatus("online"), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaqFeedback = async (messageId: string, analyticId: number, wasHelpful: boolean) => {
    try {
      await api.post("/chat/faq-feedback", {
        analytic_id: analyticId,
        was_helpful: wasHelpful,
      });

      // Update message to mark feedback as given
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedbackGiven: true } : msg
        )
      );

      console.log(`FAQ Feedback sent: ${wasHelpful ? 'Helpful' : 'Not Helpful'}`);
    } catch (error) {
      console.error("Failed to send FAQ feedback:", error);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-pln-primary to-pln-light shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
        >
          <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <div
            className={cn(
              "fixed z-50 transition-all",
              isExpanded
                ? "inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                : "bottom-6 right-6 pointer-events-none",
            )}
            onClick={(e) => {
              // Close on backdrop click if expanded
              if (isExpanded && e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              layout
              initial={
                isExpanded
                  ? { opacity: 0, scale: 0.95 }
                  : { opacity: 0, y: 20, scale: 0.95 }
              }
              animate={
                isExpanded
                  ? {
                      opacity: 1,
                      scale: 1,
                      width: "1000px",
                      height: "85vh",
                      y: 0,
                    }
                  : {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      width: "350px",
                      height: "500px",
                    }
              }
              exit={
                isExpanded
                  ? { opacity: 0, scale: 0.95 }
                  : { opacity: 0, y: 20, scale: 0.95 }
              }
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex overflow-hidden pointer-events-auto",
                isExpanded
                  ? "w-full max-w-[1000px] h-[85vh]"
                  : "w-[350px] h-[500px] flex-col",
              )}
            >
              {/* SIDEBAR (Only visible when Expanded) */}
              {isExpanded && (
                <div className="w-[280px] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                      Riwayat Chat
                    </h3>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-pln-primary hover:bg-pln-primary/10"
                      onClick={handleNewChat}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-xs font-medium bg-white hover:bg-slate-100 border-dashed border-slate-300 text-slate-600 mb-2"
                      onClick={handleNewChat}
                    >
                      <PlusIcon className="mr-2 h-3.5 w-3.5" />
                      Mulai Chat Baru
                    </Button>

                    <div className="text-xs font-semibold text-slate-400 px-2 mt-4 mb-2 uppercase tracking-wider">
                      Terbaru
                    </div>

                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "group w-full flex items-center gap-2 text-xs py-2.5 px-3 rounded-lg transition-colors cursor-pointer",
                          sessionId === session.id
                            ? "bg-pln-primary/10 text-pln-primary font-semibold"
                            : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800",
                        )}
                        onClick={() => handleSessionClick(session.id)}
                      >
                        <ClockIcon className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                        <span className="truncate flex-1">
                          {session.title || "Percakapan"}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                            >
                              <EllipsisHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleRenameSession(
                                  session.id,
                                  session.title,
                                  e,
                                )
                              }
                            >
                              <PencilSquareIcon className="mr-2 h-4 w-4" />{" "}
                              Ganti Nama
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleDeleteSession(session.id, e)
                              }
                              className="text-red-500 focus:text-red-500"
                            >
                              <TrashIcon className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MAIN CONTENT Area */}
              <div className="flex-1 flex flex-col h-full min-w-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-pln-primary to-pln-light p-4 flex items-center justify-between cursor-move shrink-0">
                  <div className="flex items-center gap-3 text-white overflow-hidden">
                    <div className="p-2 bg-white/20 rounded-lg shadow-sm backdrop-blur-sm shrink-0">
                      <SparklesIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm flex items-center gap-2">
                        AI Assistant
                        {/* Dynamic Status Indicator */}
                        <span
                          className={cn(
                            "inline-block w-2.5 h-2.5 rounded-full animate-pulse shadow-md transition-colors duration-500",
                            connectionStatus === "online" &&
                              "bg-green-500 shadow-green-400",
                            connectionStatus === "error" &&
                              "bg-red-500 shadow-red-400 animate-none",
                            connectionStatus === "connecting" &&
                              "bg-yellow-400 shadow-yellow-300",
                          )}
                          title={
                            connectionStatus === "online"
                              ? "Online"
                              : connectionStatus === "error"
                                ? "Gangguan Koneksi"
                                : "Menghubungkan..."
                          }
                        ></span>
                      </h3>
                      <p
                        className="text-xs text-white/80 truncate block"
                        title={currentTitle}
                      >
                        {currentTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* History Toggle (Only Small Mode) */}
                    {!isExpanded && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                        onClick={toggleHistory}
                        title="Riwayat Chat"
                      >
                        <ClockIcon className="h-5 w-5" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                      onClick={() => setIsExpanded(!isExpanded)}
                      title={isExpanded ? "Kecilkan" : "Besarkan"}
                    >
                      {isExpanded ? (
                        <ArrowsPointingInIcon className="h-5 w-5" />
                      ) : (
                        <ArrowsPointingOutIcon className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
                      onClick={() => setIsOpen(false)}
                      title="Tutup"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                {!showHistory ? (
                  /* Messages Area (Normal) */
                  <>
                    <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto">
                      <div className="flex flex-col gap-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                              msg.role === "user"
                                ? "bg-pln-primary text-white self-end rounded-br-none"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 self-start rounded-bl-none",
                            )}
                          >
                            {msg.text}

                            {/* Attachment Display */}
                            {msg.attachmentUrl && (
                              <div className="mt-2 text-xs">
                                {msg.attachmentUrl.match(
                                  /\.(jpeg|jpg|gif|png)/,
                                ) || msg.attachmentUrl.startsWith("blob:") ? (
                                  <img
                                    src={msg.attachmentUrl}
                                    alt="attachment"
                                    onClick={() =>
                                      setImageModal(msg.attachmentUrl!)
                                    }
                                    className="rounded-lg max-w-full h-auto max-h-[200px] border border-white/20 cursor-pointer hover:opacity-90 transition-opacity"
                                    title="Klik untuk memperbesar"
                                  />
                                ) : (
                                  <a
                                    href={msg.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 underline text-xs pt-1 hover:text-white/80"
                                  >
                                    <PaperClipIcon className="h-3 w-3" /> Lihat
                                    Lampiran
                                  </a>
                                )}
                              </div>
                            )}

                            {msg.role === "ai" && (
                              <div className="mt-2 flex gap-2">
                                {/* FAQ Feedback Buttons (only if from FAQ) */}
                                {msg.analyticId && !msg.feedbackGiven && (
                                  <>
                                    <button
                                      onClick={() => handleFaqFeedback(msg.id, msg.analyticId!, true)}
                                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                      title="Helpful"
                                    >
                                      <HandThumbUpIcon className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleFaqFeedback(msg.id, msg.analyticId!, false)}
                                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                      title="Not Helpful"
                                    >
                                      <HandThumbDownIcon className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
                                {msg.feedbackGiven && (
                                  <span className="text-xs text-gray-400">Terima kasih atas feedback Anda!</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {isLoading && (
                          <div className="self-start bg-white dark:bg-slate-800 border p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-pln-primary/60 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-pln-primary/60 rounded-full animate-bounce delay-100"></span>
                              <span className="w-2 h-2 bg-pln-primary/60 rounded-full animate-bounce delay-200"></span>
                            </div>
                            <span className="text-xs text-slate-400">
                              Sedang mengetik...
                            </span>
                          </div>
                        )}
                        <div ref={scrollRef} />
                      </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-white dark:bg-slate-900 shrink-0">
                      {/* File Preview */}
                      {attachment && (
                        <div className="mb-2 px-2 flex items-center gap-2">
                          <div className="bg-slate-100 dark:bg-slate-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                            <span className="truncate max-w-[150px]">
                              {attachment.name}
                            </span>
                            <button
                              onClick={() => setAttachment(null)}
                              className="text-slate-500 hover:text-red-500"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSend();
                        }}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-slate-500 hover:text-pln-primary"
                          onClick={() => fileInputRef.current?.click()}
                          title="Lampirkan File"
                        >
                          <PaperClipIcon className="h-5 w-5" />
                        </Button>

                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={
                            isExpanded
                              ? "Ketik pertanyaan Anda..."
                              : "Tanya sesuatu..."
                          }
                          className="flex-1 rounded-full px-4 border-slate-300 focus:border-pln-primary focus:ring-pln-primary/20"
                          autoFocus
                        />
                        <Button
                          type="submit"
                          size="icon"
                          className="bg-pln-primary hover:bg-pln-dark rounded-full h-10 w-10 shadow-md transition-transform active:scale-95"
                          disabled={isLoading || (!input.trim() && !attachment)}
                        >
                          <PaperAirplaneIcon className="h-5 w-5" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  /* History List (Small View) */
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto p-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm text-slate-700">
                        Riwayat Chat
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNewChat}
                        className="h-8 text-xs bg-white"
                      >
                        <PlusIcon className="mr-1 h-3 w-3" /> Baru
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "group w-full flex items-center gap-3 text-left text-xs py-3 px-3 rounded-lg transition-colors bg-white border border-slate-200 shadow-sm hover:shadow-md cursor-pointer",
                            sessionId === session.id
                              ? "bg-pln-primary/5 border-pln-primary/30"
                              : "text-slate-600",
                          )}
                          onClick={() => handleSessionClick(session.id)}
                        >
                          <ClockIcon className="h-4 w-4 flex-shrink-0 opacity-50 text-pln-primary" />
                          <div className="flex-1 min-w-0">
                            <span className="block font-medium truncate">
                              {session.title || "Percakapan"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(
                                session.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                              >
                                <EllipsisHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) =>
                                  handleRenameSession(
                                    session.id,
                                    session.title,
                                    e,
                                  )
                                }
                              >
                                <PencilSquareIcon className="mr-2 h-4 w-4" />{" "}
                                Ganti Nama
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) =>
                                  handleDeleteSession(session.id, e)
                                }
                                className="text-red-500 focus:text-red-500"
                              >
                                <TrashIcon className="mr-2 h-4 w-4" /> Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {imageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setImageModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setImageModal(null)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>
              <img
                src={imageModal}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
