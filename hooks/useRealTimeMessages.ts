"use client";

import { useEffect, useRef } from "react";
import { getEcho } from "@/lib/echo";

// Types for Direct Messages
interface DirectMessageData {
  message: {
    id: number;
    conversation_id: number;
    sender: {
      id: number;
      name: string;
      avatar: string | null;
      role: string;
    };
    message: string;
    attachment_path: string | null;
    attachment_name: string | null;
    attachment_type: string | null;
    created_at: string;
  };
  conversation: {
    id: number;
    type: string;
    last_message: string;
    last_message_at: string;
  };
}

// Types for Class Messages
interface ClassMessageData {
  id: number;
  class_id: number;
  user_id: number;
  message: string;
  message_type: string;
  is_answered: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

// Types for Status Updates
interface StatusUpdateData {
  status: string;
  updated_at: string;
  updated_by?: {
    id: number;
    name: string;
  };
}

// Types for Pusher Subscription Error
interface PusherSubscriptionError {
  type: string;
  error: string;
  status?: number;
}

// Types for Support Replies
interface SupportReplyData {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

// Hook for Direct Messages
export function useDirectMessageChannel(
  conversationId: number | null,
  onNewMessage: (data: DirectMessageData) => void,
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!conversationId) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`conversation.${conversationId}`);

    channel.listen(".new.direct.message", (data: DirectMessageData) => {
      callbackRef.current(data);
    });

    return () => {
      echo.leave(`conversation.${conversationId}`);
    };
  }, [conversationId]);
}

// Hook for User's personal messages channel (inbox notifications)
export function useUserMessagesChannel(
  userId: number | null,
  onNewMessage: (data: DirectMessageData) => void,
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!userId) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`user.${userId}.messages`);

    channel.listen(".new.direct.message", (data: DirectMessageData) => {
      callbackRef.current(data);
    });

    return () => {
      echo.leave(`user.${userId}.messages`);
    };
  }, [userId]);
}

// Hook for Class Chat
export function useClassChatChannel(
  classId: number | null,
  onNewMessage: (data: ClassMessageData) => void,
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!classId) return;

    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`class-chat.${classId}`);

    channel.listen(".message.new", (data: ClassMessageData) => {
      callbackRef.current(data);
    });

    return () => {
      echo.leave(`class-chat.${classId}`);
    };
  }, [classId]);
}

// Hook for Support Ticket
export function useSupportTicketChannel(
  ticketId: number | null,
  onNewReply: (data: SupportReplyData) => void,
  onStatusUpdate?: (data: StatusUpdateData) => void,
) {
  const callbackRef = useRef(onNewReply);
  const statusCallbackRef = useRef(onStatusUpdate);
  callbackRef.current = onNewReply;
  statusCallbackRef.current = onStatusUpdate;

  useEffect(() => {
    if (!ticketId) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `support-ticket.${ticketId}`;
    const channel = echo.private(channelName);

    channel.listen(".reply.new", (data: SupportReplyData) => {
      callbackRef.current(data);
    });

    channel.listen(".status.updated", (data: StatusUpdateData) => {
      if (statusCallbackRef.current) {
        statusCallbackRef.current(data);
      }
    });

    return () => {
      echo.leave(channelName);
    };
  }, [ticketId]);
}

// Hook for Escalation Ticket (Admin <-> Super Admin)
// Types for Escalation Reply
interface EscalationReplyData {
  id: number;
  ticket_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

export function useEscalationTicketChannel(
  ticketId: number | null,
  onNewReply: (data: EscalationReplyData) => void,
  onStatusUpdate?: (data: StatusUpdateData) => void,
) {
  const callbackRef = useRef(onNewReply);
  const statusCallbackRef = useRef(onStatusUpdate);
  callbackRef.current = onNewReply;
  statusCallbackRef.current = onStatusUpdate;

  useEffect(() => {
    if (!ticketId) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `escalation-ticket.${ticketId}`;
    const channel = echo.private(channelName);

    channel.listen(".reply.new", (data: EscalationReplyData) => {
      callbackRef.current(data);
    });

    channel.listen(".status.updated", (data: StatusUpdateData) => {
      if (statusCallbackRef.current) {
        statusCallbackRef.current(data);
      }
    });

    return () => {
      echo.leave(channelName);
    };
  }, [ticketId]);
}
