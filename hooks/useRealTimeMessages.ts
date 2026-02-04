"use client";

import { useEffect, useCallback, useRef } from "react";
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
) {
  const callbackRef = useRef(onNewReply);
  callbackRef.current = onNewReply;

  useEffect(() => {
    if (!ticketId) return;

    const echo = getEcho();
    if (!echo) {
      console.warn("Echo not available for support ticket channel");
      return;
    }

    const channelName = `support-ticket.${ticketId}`;
    console.log("Subscribing to channel:", channelName);

    const channel = echo.private(channelName);

    channel.listen(".reply.new", (data: SupportReplyData) => {
      console.log("Received reply.new event:", data);
      callbackRef.current(data);
    });

    // Debug channel connection
    channel.subscription.bind("pusher:subscription_succeeded", () => {
      console.log("Successfully subscribed to:", channelName);
    });

    channel.subscription.bind("pusher:subscription_error", (status: any) => {
      console.error("Subscription error:", status);
    });

    return () => {
      console.log("Unsubscribing from channel:", channelName);
      echo.leave(channelName);
    };
  }, [ticketId]);
}

// Hook for Escalation Ticket (Admin <-> Super Admin)
export function useEscalationTicketChannel(
  ticketId: number | null,
  onNewReply: (data: any) => void,
  onStatusUpdate?: (data: any) => void,
) {
  const callbackRef = useRef(onNewReply);
  const statusCallbackRef = useRef(onStatusUpdate);
  callbackRef.current = onNewReply;
  statusCallbackRef.current = onStatusUpdate;

  useEffect(() => {
    if (!ticketId) return;

    const echo = getEcho();
    if (!echo) {
      console.warn("Echo not available for escalation ticket channel");
      return;
    }

    const channelName = `escalation-ticket.${ticketId}`;
    console.log("Subscribing to escalation channel:", channelName);

    const channel = echo.private(channelName);

    // Listen for new replies
    channel.listen(".reply.new", (data: any) => {
      console.log("Received escalation reply.new event:", data);
      callbackRef.current(data);
    });

    // Listen for status updates
    channel.listen(".status.updated", (data: any) => {
      console.log("Received escalation status.updated event:", data);
      if (statusCallbackRef.current) {
        statusCallbackRef.current(data);
      }
    });

    // Debug channel connection
    channel.subscription.bind("pusher:subscription_succeeded", () => {
      console.log("Successfully subscribed to:", channelName);
    });

    channel.subscription.bind("pusher:subscription_error", (status: any) => {
      console.error("Escalation subscription error:", status);
    });

    return () => {
      console.log("Unsubscribing from escalation channel:", channelName);
      echo.leave(channelName);
    };
  }, [ticketId]);
}
