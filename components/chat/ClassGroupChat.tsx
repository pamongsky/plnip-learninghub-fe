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
  mentioned_user_id?: number;
  image_path?: string;
  replyToMessage?: Message;
  mentionedUser?: User;
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
  const [showOnlyUnanswered, setShowOnlyUnanswered] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    number | null
  >(null);
  const [replyNotification, setReplyNotification] = useState<{
    userName: string;
    message: string;
    messageId: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to a specific message and highlight it (like WhatsApp)
  const scrollToMessage = (messageId: number) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight the message briefly
      setHighlightedMessageId(messageId);
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000); // Remove highlight after 2 seconds
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

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
        reply_to: data.reply_to,
        mentioned_user_id: data.mentioned_user_id,
        // Handle both snake_case and camelCase from broadcast
        replyToMessage: data.reply_to_message || data.replyToMessage,
        mentionedUser: data.mentioned_user || data.mentionedUser,
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

        // Check if this message is a reply to current user's message (WhatsApp-like notification)
        if (
          newMsg.mentioned_user_id &&
          Number(newMsg.mentioned_user_id) === Number(currentUserId)
        ) {
          // Show browser notification if permitted
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification(`${newMsg.user.name} membalas pesan Anda`, {
              body: newMsg.message.substring(0, 100),
              icon: "/favicon.ico",
              tag: `reply-${newMsg.id}`,
            });
          }
          // Show in-app toast notification
          setReplyNotification({
            userName: newMsg.user.name,
            message: newMsg.message,
            messageId: newMsg.id,
          });
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setReplyNotification(null);
          }, 5000);
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

      const transformedMessages: Message[] = messagesArray.map((msg: any) => ({
        id: msg.id,
        class_id: msg.class_id,
        user_id: msg.user_id,
        message: msg.message,
        message_type: msg.message_type,
        is_answered: msg.is_answered,
        answered_by: msg.answered_by,
        answered_at: msg.answered_at,
        reply_to: msg.reply_to,
        mentioned_user_id: msg.mentioned_user_id,
        image_path: msg.image_path,
        created_at: msg.created_at,
        user: msg.user || { id: msg.user_id, name: "User" },
        answeredByUser: msg.answered_by_user,
        // Handle both snake_case (Laravel) and camelCase formats
        replyToMessage: msg.reply_to_message || msg.replyToMessage,
        mentionedUser: msg.mentioned_user || msg.mentionedUser,
      }));
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

  // Filtered messages based on show only unanswered
  const filteredMessages = showOnlyUnanswered
    ? messages.filter((m) => m.message_type === "question" && !m.is_answered)
    : messages;

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
      // Include reply data for optimistic display
      reply_to: replyTo?.id,
      mentioned_user_id: replyTo?.user_id,
      replyToMessage: replyTo || undefined,
      mentionedUser: replyTo?.user,
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
      if (replyTo) {
        formData.append("reply_to", replyTo.id.toString());
        formData.append("mentioned_user_id", replyTo.user_id.toString());
      }

      const response = await classChatApi.sendMessage(classId, formData);

      console.log("✅ Server response received, updating optimistic message");
      console.log(
        "🔄 Updating tempId:",
        tempId,
        "to real ID:",
        response.data.id,
      );

      // Update optimistic message in place (don't remove+add to avoid animation flicker)
      setMessages((prev) => {
        // Check if message already exists from broadcast
        const broadcastExists = prev.some((msg) => msg.id === response.data.id);

        if (broadcastExists) {
          // Broadcast arrived first, just remove optimistic message
          console.log(
            "⏭️ Broadcast already added, removing optimistic:",
            tempId,
          );
          return prev.filter((msg) => msg.id !== tempId);
        }

        // Update optimistic message in place (keeps same position, no animation)
        return prev.map((msg) => {
          if (msg.id === tempId) {
            console.log("✅ Updating optimistic to real message");
            const updatedMsg: Message = {
              ...msg,
              ...response.data,
              // Keep original created_at to maintain stable key for animation
              created_at: msg.created_at,
              // Keep reply data from optimistic message (API might not return full nested object)
              replyToMessage: msg.replyToMessage,
              mentionedUser: msg.mentionedUser,
              user: {
                id: currentUserId,
                name: "Anda",
                avatar: response.data.user?.avatar,
              },
            };
            return updatedMsg;
          }
          return msg;
        });
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));

      // Restore input on error
      setNewMessage(currentMessage);
      setMessageType(currentType);

      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Gagal mengirim pesan: ${error.message}. Silakan coba lagi.`);
      } else {
        alert(
          "Gagal mengirim pesan. Silakan periksa koneksi internet Anda dan coba lagi.",
        );
      }
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
      className={`relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}
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
              {showOnlyUnanswered ? filteredMessages.length : messages.length}{" "}
              pesan •{" "}
              {
                messages.filter(
                  (m) => m.message_type === "question" && !m.is_answered,
                ).length
              }{" "}
              pertanyaan belum dijawab
            </p>
          </div>
        </div>
        {isInstructor && (
          <button
            onClick={() => setShowOnlyUnanswered(!showOnlyUnanswered)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showOnlyUnanswered
                ? "bg-white text-pln-primary"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
            {showOnlyUnanswered ? "Tampilkan Semua" : "Pertanyaan Saja"}
          </button>
        )}
      </div>

      {/* Reply Notification Toast - WhatsApp style */}
      <AnimatePresence>
        {replyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute top-20 left-1/2 z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg max-w-[90%] cursor-pointer hover:bg-emerald-600 transition-colors"
            onClick={() => {
              scrollToMessage(replyNotification.messageId);
              setReplyNotification(null);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowLeftIcon className="h-4 w-4 rotate-180" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {replyNotification.userName} membalas pesan Anda
                </p>
                <p className="text-xs text-white/80 truncate">
                  {replyNotification.message}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setReplyNotification(null);
                }}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {showOnlyUnanswered ? (
              <>
                <CheckCircleSolid className="h-12 w-12 text-emerald-300 dark:text-emerald-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  Semua pertanyaan sudah terjawab!
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Klik "Tampilkan Semua" untuk melihat semua pesan
                </p>
              </>
            ) : (
              <>
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  Belum ada pesan
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Mulai diskusi dengan mengirim pesan
                </p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredMessages.map((msg) => {
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
                  id={`message-${msg.id}`}
                  key={`msg-${msg.created_at}-${msg.user_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""} ${
                    highlightedMessageId === msg.id
                      ? "animate-pulse bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl p-2 -m-2 transition-colors duration-300"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold ${
                      isOwnMessage
                        ? "bg-pln-primary text-white"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white"
                    }`}
                  >
                    {msg.user?.avatar ? (
                      <img
                        src={
                          msg.user.avatar.startsWith("http")
                            ? msg.user.avatar
                            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${msg.user.avatar}`
                        }
                        alt={msg.user.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement!.innerHTML =
                            getInitials(msg.user?.name || "U");
                        }}
                      />
                    ) : (
                      getInitials(msg.user?.name || "U")
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

                      {/* Reply reference - WhatsApp style with clear background - Click to scroll */}
                      {msg.replyToMessage && (
                        <div
                          onClick={() =>
                            scrollToMessage(msg.replyToMessage!.id)
                          }
                          className={`mb-3 p-3 rounded-lg border-l-[5px] cursor-pointer hover:opacity-80 transition-opacity ${
                            isOwnMessage
                              ? "bg-[#dcf8c6]/30 border-white/90"
                              : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-400"
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-1.5">
                            <span
                              className={`text-xs font-bold ${
                                isOwnMessage
                                  ? "text-white"
                                  : "text-emerald-700 dark:text-emerald-400"
                              }`}
                            >
                              {msg.mentionedUser
                                ? msg.mentionedUser.name
                                : msg.replyToMessage.user?.name || "User"}
                            </span>
                          </div>
                          <p
                            className={`text-xs leading-relaxed line-clamp-3 ${
                              isOwnMessage
                                ? "text-white/95"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {msg.replyToMessage.image_path &&
                            !msg.replyToMessage.message.trim()
                              ? "📷 Foto"
                              : msg.replyToMessage.message}
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

        {/* Reply preview - WhatsApp style */}
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="flex items-start gap-3 p-3">
              {/* Left border accent - WhatsApp style */}
              <div className="w-1 h-full bg-pln-primary rounded-full absolute left-0" />

              {/* Avatar */}
              <div className="flex-shrink-0 ml-2">
                {replyTo.user.avatar ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL?.replace("/api", "")}/storage/${replyTo.user.avatar}`}
                    alt={replyTo.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white text-xs font-semibold">${getInitials(replyTo.user.name)}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pln-primary to-pln-light flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials(replyTo.user.name)}
                  </div>
                )}
              </div>

              {/* Reply content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-pln-primary dark:text-pln-light">
                    {replyTo.user.name}
                  </span>
                  {replyTo.message_type === "question" && (
                    <QuestionMarkCircleIcon className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 break-words">
                  {replyTo.image_path && !replyTo.message.trim()
                    ? "📷 Gambar"
                    : replyTo.message}
                </p>
              </div>

              {/* Cancel button */}
              <button
                onClick={cancelReply}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Batal membalas"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
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
