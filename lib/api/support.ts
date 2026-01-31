import api from "../axios";

// Types
export interface SupportTicket {
  id: number;
  user_id: number;
  ticket_number: string;
  subject: string;
  description: string;
  category: "technical" | "learning" | "certificate" | "payment" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed" | "escalated";
  assigned_to: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
  assigned_admin?: {
    id: number;
    name: string;
    email: string;
  };
  attachments?: string[] | null;
  replies?: SupportReply[];
  replies_count?: number;
}

export interface SupportReply {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  attachments?: string[] | null;
  is_admin_reply: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  today: number;
  by_priority?: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: string;
  priority?: string;
  class_id?: number;
}

// Pagination response from Laravel
interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// API Functions
export const supportApi = {
  // Get all tickets (with optional filters)
  getTickets: async (params?: {
    status?: string;
    priority?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    tickets: SupportTicket[];
    meta: { current_page: number; last_page: number; total: number };
  }> => {
    const response = await api.get<{
      success: boolean;
      data: PaginatedResponse<SupportTicket>;
    }>("/support/tickets", { params });

    const paginator = response.data.data;
    return {
      tickets: paginator.data || [],
      meta: {
        current_page: paginator.current_page,
        last_page: paginator.last_page,
        total: paginator.total,
      },
    };
  },

  // Get single ticket
  getTicket: async (id: number) => {
    const response = await api.get<{ data: SupportTicket }>(
      `/support/tickets/${id}`,
    );
    return response.data.data;
  },

  // Create new ticket
  createTicket: async (data: CreateTicketData) => {
    const response = await api.post<{ data: SupportTicket; message: string }>(
      "/support/tickets",
      data,
    );
    return response.data;
  },

  // Add reply to ticket
  addReply: async (ticketId: number, message: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append("message", message);

    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });
    }

    const response = await api.post<{ data: SupportReply; message: string }>(
      `/support/tickets/${ticketId}/reply`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Update ticket status (admin only)
  updateStatus: async (
    ticketId: number,
    status: string,
    assignedTo?: number,
  ) => {
    const response = await api.patch<{ data: SupportTicket; message: string }>(
      `/support/tickets/${ticketId}/status`,
      { status, assigned_to: assignedTo },
    );
    return response.data;
  },

  // Get ticket statistics
  getStats: async () => {
    const response = await api.get<{ data: TicketStats }>(
      "/support/tickets/stats",
    );
    return response.data.data;
  },
};

export default supportApi;
