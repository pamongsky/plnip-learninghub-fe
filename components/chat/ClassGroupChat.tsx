"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { classChatApi, type ClassMessage } from "@/lib/api";
import { useClassChatChannel } from "@/hooks/useRealTimeMessages";

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface Message {
  id: number;
  class_id: number;
  user_id: number;
  message: string;
  message_type: "discussion" | "question";
  is_answered: boolean;
  answered_by?: number;
  answered_at?: string;
  reply_to?: number;
  image_path?: string;
  replyToMessage?: Message;
  created_at: string;
  user: User;
  answeredByUser?: User;
}

interface ClassGroupChatProps {
  classId: number;
  className?: string;
  currentUserId: number;
  isInstructor?: boolean;
  onQuestionCountChange?: (count: number) => void;
}

export default function ClassGroupChat({
  classId,
  className,
  currentUserId,
  isInstructor = false,
  onQuestionCountChange,
}: ClassGroupChatProps) {
  // Debug: Log props on mount
  useEffect(() => {
    console.log("🎯 ClassGroupChat Props:", {
      classId,
      currentUserId,
      currentUserId_type: typeof currentUserId,
      isInstructor,
    });
  }, [classId, currentUserId, isInstructor]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<"discussion" | "question">(
    "discussion",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [classId]);

  // Real-time: Listen for new messages
  const handleNewClassMessage = useCallback(
    (data: any) => {
      const newMsg: Message = {
        id: data.id,
        class_id: data.class_id,
        user_id: data.user_id,
        message: data.message,
        message_type: data.message_type,
        is_answered: data.is_answered,
        image_path: data.image_path,
        created_at: data.created_at,
        user: data.user,
      };

      // Add message only if it doesn't already exist (prevent duplicates)
      setMessages((prev) => {
        // Check if message with same ID already exists
        const existsById = prev.some((msg) => msg.id === newMsg.id);
        if (existsById) {
          console.log("⏭️ Skipping duplicate message by ID:", newMsg.id);
          return prev;
        }

        // Skip if this is from current user (already handled by optimistic update)
        if (Number(newMsg.user_id) === Number(currentUserId)) {
          console.log(
            "⏭️ Skipping own message from broadcast (optimistic update already handled)",
          );
          return prev;
        }

        console.log("✅ Adding new message from broadcast:", newMsg.id);
        return [...prev, newMsg];
      });
    },
    [currentUserId],
  );

  // Subscribe to real-time class chat channel
  useClassChatChannel(classId, handleNewClassMessage);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await classChatApi.getMessages(classId);
      // Backend returns { data: { data: [...] } } because of pagination
      // @ts-ignore - API type definition doesn't match backend pagination structure exactly
      const messagesArray = response.data.data || [];

      const transformedMessages: Message[] = messagesArray.map(
        (msg: ClassMessage) => ({
          id: msg.id,
          class_id: msg.class_id,
          user_id: msg.user_id,
          message: msg.message,
          message_type: msg.message_type,
          is_answered: msg.is_answered,
          answered_by: msg.answered_by,
          answered_at: msg.answered_at,
          created_at: msg.created_at,
          user: msg.user || { id: msg.user_id, name: "User" },
          answeredByUser: msg.answered_by_user,
        }),
      );
      setMessages(transformedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update question count
  useEffect(() => {
    const unansweredQuestions = messages.filter(
      (m) => m.message_type === "question" && !m.is_answered,
    ).length;
    onQuestionCountChange?.(unansweredQuestions);
  }, [messages, onQuestionCountChange]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    setIsSending(true);
    const messageText = newMessage.trim() || "[Gambar]";
    const tempId = Date.now(); // Temporary ID for optimistic update

    // Optimistic update - show message immediately
    const optimisticMessage: Message = {
      id: tempId,
      class_id: classId,
      user_id: currentUserId,
      message: messageText,
      message_type: messageType,
      is_answered: false,
      created_at: new Date().toISOString(),
      user: {
        id: currentUserId,
        name: "Anda",
      },
      image_path: imagePreview || undefined,
    };

    // Add optimistic message
    setMessages((prev) => [...prev, optimisticMessage]);
    console.log("⚡ Optimistic message added:", tempId);

    // Clear input immediately for better UX
    const currentMessage = newMessage;
    const currentType = messageType;
    const currentImage = selectedImage;
    setNewMessage("");
    setMessageType("discussion");
    setReplyTo(null);
    handleRemoveImage();

    try {
      const formData = new FormData();
      formData.append("message", messageText);
      formData.append("message_type", currentType);
      if (currentImage) {
        formData.append("image", currentImage);
      }

      const response = await classChatApi.sendMessage(classId, formData);

      console.log("✅ Server response received, replacing optimistic message");
      console.log(
        "🔄 Removing tempId:",
        tempId,
        "Adding real ID:",
        response.data.id,
      );

      // Remove optimistic message and add real message from server
      setMessages((prev) => {
        // Filter out the temp message
        const withoutTemp = prev.filter((msg) => msg.id !== tempId);

        // Add the real message from server with "Anda" as name for own messages
        return [
          ...withoutTemp,
          {
            ...response.data,
            user: {
              id: currentUserId,
              name: "Anda", // Keep "Anda" for own messages
              avatar: response.data.user?.avatar,
            },
          },
        ];
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      // Restore input on error
      setNewMessage(currentMessage);
      setMessageType(currentType);
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    // Focus to input
    const input = document.querySelector("textarea") as HTMLTextAreaElement;
    input?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleMarkAsAnswered = async (messageId: number) => {
    try {
      const response = await classChatApi.markAsAnswered(classId, messageId);
      const apiMessage = response.data;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                is_answered: true,
                answered_by: apiMessage.answered_by,
                answered_at: apiMessage.answered_at,
                answeredByUser: apiMessage.answered_by_user || {
                  id: currentUserId,
                  name: "Anda",
                },
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Error marking as answered:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-pln-primary to-pln-light">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Diskusi Kelas</h3>
            <p className="text-sm text-white/70">
              {messages.length} pesan •{" "}
              {
                messages.filter(
                  (m) => m.message_type === "question" && !m.is_answered,
                ).length
              }{" "}
              pertanyaan belum dijawab
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pln-primary"></div>
            <p className="mt-2 text-sm text-slate-500">Memuat pesan...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              Belum ada pesan
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Mulai diskusi dengan mengirim pesan
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              // Ensure both IDs are numbers for comparison
              const msgUserId = Number(msg.user_id);
              const currentUserIdNum = Number(currentUserId);
              const isOwnMessage = msgUserId === currentUserIdNum;
              const isQuestion = msg.message_type === "question";

              // Debug log - hapus setelah testing
              console.log("🔍 Message Comparison:", {
                message_id: msg.id,
                msg_user_id: msg.user_id,
                msg_user_id_converted: msgUserId,
                currentUserId: currentUserId,
                currentUserId_converted: currentUserIdNum,
                isOwnMessage: isOwnMessage,
                user_name: msg.user?.name,
              });

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isOwnMessage
                        ? "bg-pln-primary text-white"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white"
                    }`}
                  >
                    {msg.user.avatar ? (
                      <img
                        src={msg.user.avatar}
                        alt={msg.user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(msg.user.name)
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 max-w-[75%] ${isOwnMessage ? "text-right" : ""}`}
                  >
                    {/* Name and time */}
                    <div
                      className={`flex items-center gap-2 mb-1 ${isOwnMessage ? "justify-end" : ""}`}
                    >
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {msg.user.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`relative rounded-2xl px-4 py-3 ${
                        isOwnMessage
                          ? "bg-gradient-to-r from-pln-primary to-pln-light text-white rounded-tr-sm shadow-md"
                          : isQuestion
                            ? "bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-700 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                            : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-md border border-slate-200 dark:border-slate-600"
                      }`}
                    >
                      {/* Question badge */}
                      {isQuestion && (
                        <div className="flex items-center gap-1 mb-2">
                          <QuestionMarkCircleIcon className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            PERTANYAAN
                          </span>
                          {msg.is_answered && (
                            <span className="ml-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                              <CheckCircleSolid className="h-4 w-4" />
                              Terjawab
                            </span>
                          )}
                        </div>
                      )}

                      {/* Reply reference */}
                      {msg.replyToMessage && (
                        <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-600 rounded-lg border-l-2 border-slate-300 dark:border-slate-500">
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                            Membalas {msg.replyToMessage.user.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {msg.replyToMessage.message}
                          </p>
                        </div>
                      )}

                      {/* Image attachment */}
                      {msg.image_path && (
                        <div className="mb-2">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${msg.image_path}`}
                            alt="Attachment"
                            className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() =>
                              window.open(
                                `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${msg.image_path}`,
                                "_blank",
                              )
                            }
                          />
                        </div>
                      )}

                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>

                      {/* Answered by info */}
                      {isQuestion && msg.is_answered && msg.answeredByUser && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Dijawab oleh {msg.answeredByUser.name}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Reply button */}
                      <button
                        onClick={() => handleReply(msg)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ArrowLeftIcon className="h-3 w-3 rotate-180" />
                        Balas
                      </button>

                      {/* Mark as answered button (for instructor) */}
                      {isInstructor &&
                        isQuestion &&
                        !msg.is_answered &&
                        !isOwnMessage && (
                          <button
                            onClick={() => handleMarkAsAnswered(msg.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all shadow-sm"
                          >
                            <CheckCircleSolid className="h-4 w-4" />
                            Tandai Terjawab
                          </button>
                        )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
        {/* Message type selector */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setMessageType("discussion")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              messageType === "discussion"
                ? "bg-pln-primary text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Diskusi
          </button>
          <button
            onClick={() => setMessageType("question")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              messageType === "question"
                ? "bg-amber-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <QuestionMarkCircleIcon className="h-4 w-4" />
            Pertanyaan
          </button>
        </div>

        {/* Reply reference */}
        {replyTo && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Membalas {replyTo.user.name}
                </span>
              </div>
              <button
                onClick={cancelReply}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 line-clamp-2">
              {replyTo.message}
            </p>
          </div>
        )}

        {/* Image preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-40 rounded-lg border-2 border-pln-primary"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Input field */}
        <div className="flex items-end gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title="Upload Gambar"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                messageType === "question"
                  ? "Tulis pertanyaan untuk instruktur..."
                  : "Tulis pesan diskusi..."
              }
              rows={1}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedImage) || isSending}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              newMessage.trim() || selectedImage
                ? "bg-pln-primary text-white hover:bg-pln-dark"
                : "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </motion.button>
        </div>

        {messageType === "question" && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            Pertanyaan akan dinotifikasi ke instruktur
          </p>
        )}
      </div>
    </div>
  );
}
