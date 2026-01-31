"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  CheckCircleIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  messagesApi,
  type Conversation as ApiConversation,
  type DirectMessage,
} from "@/lib/api";
import {
  useDirectMessageChannel,
  useUserMessagesChannel,
} from "@/hooks/useRealTimeMessages";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Message {
  id: number;
  conversation_id: number;
  sender: User;
  message: string;
  attachment_path?: string;
  attachment_name?: string;
  attachment_type?: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: number;
  type: string;
  participant: User;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

interface DirectMessageChatProps {
  currentUser: User;
  isOpen?: boolean;
  onClose?: () => void;
  initialConversationId?: number;
  initialUserId?: number;
}

// Role label mapping
const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  instructor: "Instruktur",
  user: "Peserta",
};

// Role colors
const roleColors: Record<string, string> = {
  superadmin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  instructor: "bg-amber-100 text-amber-700",
  user: "bg-slate-100 text-slate-700",
};

export default function DirectMessageChat({
  currentUser,
  isOpen = true,
  onClose,
  initialConversationId,
  initialUserId,
}: DirectMessageChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Real-time: Listen for new messages in active conversation
  const handleNewMessage = useCallback(
    (data: any) => {
      const newMsg: Message = {
        id: data.message.id,
        conversation_id: data.message.conversation_id,
        sender: data.message.sender,
        message: data.message.message,
        attachment_path: data.message.attachment_path,
        attachment_name: data.message.attachment_name,
        attachment_type: data.message.attachment_type,
        is_read: false,
        created_at: data.message.created_at,
      };

      // Only add if not sent by current user (to avoid duplicates)
      if (newMsg.sender.id !== currentUser.id) {
        setMessages((prev) => [...prev, newMsg]);

        // Update conversation last message
        setConversations((prev) =>
          prev.map((c) =>
            c.id === data.conversation.id
              ? {
                  ...c,
                  last_message: data.conversation.last_message,
                  last_message_at: data.conversation.last_message_at,
                }
              : c,
          ),
        );
      }
    },
    [currentUser.id],
  );

  // Real-time: Listen for new messages in user's inbox (for notifications)
  const handleInboxMessage = useCallback(
    (data: any) => {
      // Update conversation list with new message notification
      setConversations((prev) => {
        const existingIndex = prev.findIndex(
          (c) => c.id === data.conversation.id,
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            last_message: data.conversation.last_message,
            last_message_at: data.conversation.last_message_at,
            unread_count:
              activeConversation?.id === data.conversation.id
                ? 0
                : updated[existingIndex].unread_count + 1,
          };
          return updated;
        }
        // New conversation - reload conversations
        loadConversations();
        return prev;
      });
    },
    [activeConversation?.id],
  );

  // Subscribe to real-time channels
  useDirectMessageChannel(activeConversation?.id || null, handleNewMessage);
  useUserMessagesChannel(currentUser.id, handleInboxMessage);

  // Handle initial conversation or user
  useEffect(() => {
    if (initialConversationId) {
      const conv = conversations.find((c) => c.id === initialConversationId);
      if (conv) {
        selectConversation(conv);
      }
    }
  }, [initialConversationId, conversations]);

  // Load conversations from API
  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const apiConversations = await messagesApi.getConversations();
      // Transform API response to component format
      const transformedConversations: Conversation[] = apiConversations.map(
        (conv: ApiConversation) => ({
          id: conv.id,
          type: conv.type,
          participant: conv.participant || {
            id: 0,
            name: "Unknown",
            email: "",
            role: "user",
          },
          last_message: conv.last_message,
          last_message_at: conv.last_message_at,
          unread_count: conv.unread_count || 0,
        }),
      );
      setConversations(transformedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Select and load conversation
  const selectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);
    setShowNewChat(false);
    setIsLoading(true);

    try {
      const response = await messagesApi.getMessages(conversation.id);
      // Transform API messages to component format
      const transformedMessages: Message[] = response.data.map(
        (msg: DirectMessage) => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          sender:
            msg.sender ||
            (msg.sender_id === currentUser.id
              ? currentUser
              : conversation.participant),
          message: msg.message,
          attachment_path: msg.attachment_path,
          attachment_name: msg.attachment_name,
          attachment_type: msg.attachment_type,
          is_read: msg.is_read,
          created_at: msg.created_at,
        }),
      );
      setMessages(transformedMessages);

      // Mark as read
      await messagesApi.markAsRead(conversation.id);

      // Update unread count
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unread_count: 0 } : c,
        ),
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search users
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await messagesApi.searchUsers(query);
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Start new conversation
  const startNewConversation = async (user: User) => {
    try {
      // Check if conversation exists locally
      const existing = conversations.find((c) => c.participant.id === user.id);
      if (existing) {
        selectConversation(existing);
        return;
      }

      // Create or get conversation via API
      const response = await messagesApi.startConversation(user.id);
      const apiConv = response.data;

      const newConv: Conversation = {
        id: apiConv.id,
        type: apiConv.type,
        participant: user,
        last_message: apiConv.last_message,
        last_message_at: apiConv.last_message_at,
        unread_count: 0,
      };

      if (response.is_new) {
        setConversations((prev) => [newConv, ...prev]);
      }

      setActiveConversation(newConv);
      setMessages([]);
      setShowNewChat(false);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !activeConversation) return;

    setIsSending(true);
    try {
      // Send via API
      const response = await messagesApi.sendMessage(activeConversation.id, {
        message: newMessage.trim(),
        attachment: attachment || undefined,
      });

      const apiMessage = response.data;
      const message: Message = {
        id: apiMessage.id,
        conversation_id: apiMessage.conversation_id,
        sender: currentUser,
        message: apiMessage.message,
        attachment_path: apiMessage.attachment_path,
        attachment_name: apiMessage.attachment_name,
        attachment_type: apiMessage.attachment_type,
        is_read: false,
        created_at: apiMessage.created_at,
      };

      setMessages((prev) => [...prev, message]);

      // Update conversation
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? {
                ...c,
                last_message: newMessage.trim() || `[${attachment?.name}]`,
                last_message_at: new Date().toISOString(),
              }
            : c,
        ),
      );

      setNewMessage("");
      setAttachment(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle file attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File terlalu besar. Maksimal 10MB");
        return;
      }
      setAttachment(file);
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Kemarin";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("id-ID", { weekday: "short" });
    }
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
      {/* Conversation List */}
      <div
        className={`flex w-80 flex-shrink-0 flex-col border-r border-slate-200 dark:border-slate-700 ${activeConversation ? "hidden md:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pesan
          </h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="rounded-lg bg-pln-primary p-2 text-white transition hover:bg-pln-primary/90"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat / Search */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Cari nama atau email..."
                  className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startNewConversation(user)}
                      className="flex w-full items-center gap-3 p-3 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-sm font-medium text-white">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${roleColors[user.role]}`}
                      >
                        {roleLabels[user.role]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 &&
                searchResults.length === 0 &&
                !isSearching && (
                  <p className="mt-2 text-center text-sm text-slate-500">
                    Tidak ditemukan
                  </p>
                )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-pln-primary border-t-transparent" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Belum ada percakapan
              </p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-3 text-sm font-medium text-pln-primary hover:underline"
              >
                Mulai percakapan baru
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 transition hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700 ${
                  activeConversation?.id === conv.id
                    ? "bg-pln-primary/5 dark:bg-pln-primary/10"
                    : ""
                }`}
              >
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-sm font-medium text-white">
                    {getInitials(conv.participant.name)}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {conv.participant.name}
                    </p>
                    {conv.last_message_at && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${roleColors[conv.participant.role]}`}
                    >
                      {roleLabels[conv.participant.role]}
                    </span>
                    {conv.last_message && (
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {conv.last_message}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex flex-1 flex-col ${!activeConversation ? "hidden md:flex" : "flex"}`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 border-b border-slate-200 p-4 dark:border-slate-700">
              <button
                onClick={() => setActiveConversation(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 md:hidden"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-sm font-medium text-white">
                {getInitials(activeConversation.participant.name)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 dark:text-white">
                  {activeConversation.participant.name}
                </h3>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${roleColors[activeConversation.participant.role]}`}
                >
                  {roleLabels[activeConversation.participant.role]}
                </span>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => {
                const isOwn = message.sender.id === currentUser.id;
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].sender.id !== message.sender.id;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-3 flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    {!isOwn && showAvatar && (
                      <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pln-primary to-pln-light text-xs font-medium text-white">
                        {getInitials(message.sender.name)}
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="mr-2 w-8" />}

                    <div
                      className={`max-w-[70%] ${isOwn ? "text-right" : "text-left"}`}
                    >
                      <div
                        className={`inline-block rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "rounded-tr-none bg-gradient-to-r from-pln-primary to-pln-light text-white"
                            : "rounded-tl-none bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                        }`}
                      >
                        {message.attachment_path && (
                          <div className="mb-2">
                            {message.attachment_type === "image" ? (
                              <img
                                src={message.attachment_path}
                                alt={message.attachment_name}
                                className="max-h-48 rounded-lg"
                              />
                            ) : (
                              <a
                                href={message.attachment_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 rounded-lg p-2 ${
                                  isOwn
                                    ? "bg-white/20"
                                    : "bg-white dark:bg-slate-600"
                                }`}
                              >
                                <DocumentIcon className="h-5 w-5" />
                                <span className="text-sm">
                                  {message.attachment_name}
                                </span>
                              </a>
                            )}
                          </div>
                        )}
                        {message.message && (
                          <p className="text-sm">{message.message}</p>
                        )}
                      </div>
                      <div
                        className={`mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 ${isOwn ? "justify-end" : ""}`}
                      >
                        <span>{formatTime(message.created_at)}</span>
                        {isOwn &&
                          (message.is_read ? (
                            <CheckCircleIcon className="h-4 w-4 text-pln-light" />
                          ) : (
                            <CheckIcon className="h-4 w-4" />
                          ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview */}
            {attachment && (
              <div className="border-t border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center gap-3 rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
                  {attachment.type.startsWith("image/") ? (
                    <PhotoIcon className="h-8 w-8 text-pln-primary" />
                  ) : (
                    <DocumentIcon className="h-8 w-8 text-pln-primary" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setAttachment(null)}
                    className="rounded-full p-1 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t border-slate-200 p-4 dark:border-slate-700">
              <div className="flex items-end gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                >
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ketik pesan..."
                    rows={1}
                    className="max-h-32 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-pln-primary focus:outline-none focus:ring-2 focus:ring-pln-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isSending || (!newMessage.trim() && !attachment)}
                  className="rounded-xl bg-gradient-to-r from-pln-primary to-pln-light p-3 text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="rounded-full bg-slate-100 p-6 dark:bg-slate-700">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
              Pilih Percakapan
            </h3>
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Pilih percakapan dari daftar atau mulai percakapan baru untuk
              mengirim pesan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
