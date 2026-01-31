import api from '../axios';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface DirectMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  attachment_path?: string;
  attachment_name?: string;
  attachment_type?: 'image' | 'video' | 'pdf' | 'spreadsheet' | 'document' | 'file';
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender?: User;
}

export interface Conversation {
  id: number;
  user_one_id: number;
  user_two_id: number;
  type: 'admin_user' | 'instructor_admin' | 'superadmin_admin';
  last_message?: string;
  last_message_at?: string;
  last_message_by?: number;
  user_one_unread: number;
  user_two_unread: number;
  is_active: boolean;
  created_at: string;
  participant?: User; // The other participant (computed)
  unread_count?: number; // Unread for current user (computed)
}

export interface MessageStats {
  total_conversations: number;
  unread_messages: number;
  active_today: number;
  total_messages: number;
}

// API Functions
export const messagesApi = {
  // Get all conversations for current user
  getConversations: async () => {
    const response = await api.get<{ data: Conversation[] }>('/messages/conversations');
    return response.data.data;
  },

  // Start or get existing conversation with a user
  startConversation: async (userId: number) => {
    const response = await api.post<{ data: Conversation; message: string; is_new: boolean }>(
      '/messages/conversations',
      { user_id: userId }
    );
    return response.data;
  },

  // Get messages in a conversation
  getMessages: async (conversationId: number, params?: { page?: number; per_page?: number }) => {
    const response = await api.get<{
      data: DirectMessage[];
      meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>(`/messages/conversations/${conversationId}`, { params });
    return response.data;
  },

  // Send a message
  sendMessage: async (conversationId: number, data: { message: string; attachment?: File }) => {
    const formData = new FormData();
    formData.append('message', data.message);
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }

    const response = await api.post<{ data: DirectMessage; message: string }>(
      `/messages/conversations/${conversationId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Mark conversation as read
  markAsRead: async (conversationId: number) => {
    const response = await api.patch<{ message: string; marked_count: number }>(
      `/messages/conversations/${conversationId}/read`
    );
    return response.data;
  },

  // Get available users to message
  getAvailableUsers: async () => {
    const response = await api.get<{ data: User[] }>('/messages/users');
    return response.data.data;
  },

  // Search users
  searchUsers: async (query: string) => {
    const response = await api.get<{ data: User[] }>('/messages/search', {
      params: { query },
    });
    return response.data.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get<{ data: { unread_count: number } }>('/messages/unread');
    return response.data.data.unread_count;
  },

  // Get message stats
  getStats: async () => {
    const response = await api.get<{ data: MessageStats }>('/messages/stats');
    return response.data.data;
  },

  // Delete a message
  deleteMessage: async (messageId: number) => {
    const response = await api.delete<{ message: string }>(`/messages/${messageId}`);
    return response.data;
  },
};

export default messagesApi;
