import api from "../axios";

export interface AIContext {
  user_info: {
    name: string;
    role: string;
    employee_id?: string;
  };
  available_features: Array<{
    name: string;
    description: string;
    path: string;
    how_to?: string[];
  }>;
  navigation_menu: Record<string, string>;
  quick_actions: Array<{
    label: string;
    path: string;
    icon: string;
  }>;
}

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIChatResponse {
  response: string;
  conversation_id: string;
  timestamp: string;
}

export interface AISession {
  conversation_id: string;
  title: string;
  message_count: number;
  started_at: string;
  last_message_at: string;
}

export const aiAssistantApi = {
  /**
   * Get AI context (menu structure, features available to user)
   */
  getContext: async (): Promise<AIContext> => {
    const response = await api.get<{ data: AIContext }>(
      "/ai-assistant/context",
    );
    return response.data.data;
  },

  /**
   * Send message to AI assistant
   */
  chat: async (
    message: string,
    conversationId?: string,
  ): Promise<AIChatResponse> => {
    const response = await api.post<{ data: AIChatResponse }>(
      "/ai-assistant/chat",
      {
        message,
        conversation_id: conversationId,
      },
    );

    if (!response.data.data) {
      throw new Error("No data in API response");
    }

    return response.data.data;
  },

  /**
   * Get all conversation sessions
   */
  getSessions: async (): Promise<AISession[]> => {
    const response = await api.get<{ data: AISession[] }>(
      "/ai-assistant/sessions",
    );
    return response.data.data;
  },

  /**
   * Get conversation history for a session
   */
  getHistory: async (conversationId: string): Promise<AIChatMessage[]> => {
    const response = await api.get<{ data: AIChatMessage[] }>(
      "/ai-assistant/history",
      { params: { conversation_id: conversationId } },
    );
    return response.data.data;
  },

  /**
   * Delete a conversation session
   */
  deleteSession: async (conversationId: string): Promise<void> => {
    await api.delete(`/ai-assistant/sessions/${conversationId}`);
  },

  /**
   * Get course content for AI learning assistance
   */
  getCourseContent: async (courseId: number) => {
    const response = await api.get(`/ai-assistant/course/${courseId}/content`);
    return response.data.data;
  },
};
