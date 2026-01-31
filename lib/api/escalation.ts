import api from "@/lib/axios";

export interface EscalationTicket {
  id: number;
  ticket_number: string;
  admin_id: number;
  superadmin_id: number | null;
  support_ticket_id: number | null;
  type: "escalation" | "standalone";
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  category: "technical" | "access" | "moodle" | "feature_request" | "other";
  escalated_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  admin?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
  superadmin?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
  support_ticket?: {
    id: number;
    ticket_number: string;
    subject: string;
    user?: {
      id: number;
      name: string;
      email: string;
      role?: string;
    };
    replies?: Array<{
      id: number;
      message: string;
      created_at: string;
      attachments?: string[] | null;
      user: {
        id: number;
        name: string;
        email: string;
        role?: string;
      };
    }>;
  };
  replies?: EscalationReply[];
  replies_count?: number;
}

export interface EscalationReply {
  id: number;
  escalation_ticket_id: number;
  user_id: number;
  message: string;
  attachments: string[] | null;
  is_internal: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}

export interface EscalationStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  escalations: number;
  standalone: number;
}

export interface EscalationListResponse {
  tickets: EscalationTicket[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const escalationApi = {
  // Get all escalation tickets
  getTickets: async (params?: {
    status?: string;
    type?: string;
    priority?: string;
    page?: number;
    per_page?: number;
  }): Promise<EscalationListResponse> => {
    const response = await api.get("/escalations", { params });
    return response.data;
  },

  // Get escalation stats
  getStats: async (): Promise<EscalationStats> => {
    const response = await api.get("/escalations/stats");
    return response.data;
  },

  // Create standalone ticket (Admin creates new ticket to Super Admin)
  createTicket: async (data: {
    subject: string;
    description: string;
    priority: string;
    category: string;
  }): Promise<{ message: string; ticket: EscalationTicket }> => {
    const response = await api.post("/escalations", data);
    return response.data;
  },

  // Escalate support ticket to Super Admin
  escalateTicket: async (
    supportTicketId: number,
    data: {
      reason: string;
      priority: string;
    },
  ): Promise<{ message: string; escalation: EscalationTicket }> => {
    const response = await api.post(
      `/support/tickets/${supportTicketId}/escalate`,
      data,
    );
    return response.data;
  },

  // Get single escalation ticket with details
  getTicket: async (id: number): Promise<EscalationTicket> => {
    const response = await api.get(`/escalations/${id}`);
    return response.data;
  },

  // Add reply to escalation ticket
  addReply: async (
    id: number,
    message: string,
    attachments?: File[],
  ): Promise<{ message: string; reply: EscalationReply }> => {
    const formData = new FormData();
    formData.append("message", message);
    if (attachments) {
      attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });
    }

    const response = await api.post(`/escalations/${id}/reply`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Check active escalation by support ticket ID
  checkEscalationStatus: async (
    supportTicketId: number,
  ): Promise<{ exists: boolean; escalation?: EscalationTicket }> => {
    const response = await api.get(
      `/escalations/check-support/${supportTicketId}`,
    );
    return response.data;
  },

  // Update escalation ticket status
  updateStatus: async (
    id: number,
    status: string,
  ): Promise<{ message: string; ticket: EscalationTicket }> => {
    const response = await api.patch(`/escalations/${id}/status`, { status });
    return response.data;
  },
};
