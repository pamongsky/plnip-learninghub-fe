import api from "../axios";

// Types
export interface ClassMessage {
  id: number;
  class_id: number;
  user_id: number;
  message: string;
  message_type: "discussion" | "question";
  is_answered: boolean;
  answered_by?: number;
  answered_at?: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
  };
  answered_by_user?: {
    id: number;
    name: string;
  };
}

export interface QuestionStats {
  total_questions: number;
  unanswered_questions: number;
  answered_today: number;
  classes_with_questions: number;
  by_class?: Array<{
    class_id: number;
    class_name: string;
    unanswered: number;
    total: number;
  }>;
}

export interface SendMessageData {
  message: string;
  message_type: "discussion" | "question";
}

// API Functions
export const classChatApi = {
  // Get messages for a class
  getMessages: async (
    classId: number,
    params?: { page?: number; per_page?: number },
  ) => {
    const response = await api.get<{
      data: ClassMessage[];
      meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>(`/classes/${classId}/chat`, { params });
    return response.data;
  },

  // Send a message to class chat
  sendMessage: async (classId: number, data: SendMessageData | FormData) => {
    const config =
      data instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};

    const response = await api.post<{ data: ClassMessage; message: string }>(
      `/classes/${classId}/chat`,
      data,
      config,
    );
    return response.data;
  },

  // Get new messages since last message ID
  getNewMessages: async (classId: number, lastMessageId: number) => {
    const response = await api.get<{ data: ClassMessage[] }>(
      `/classes/${classId}/chat/new`,
      { params: { last_id: lastMessageId } },
    );
    return response.data.data;
  },

  // Get questions only (for instructor)
  getQuestions: async (
    classId: number,
    params?: { status?: "all" | "answered" | "unanswered" },
  ) => {
    const response = await api.get<{ data: ClassMessage[] }>(
      `/classes/${classId}/chat/questions`,
      { params },
    );
    return response.data.data;
  },

  // Mark question as answered (instructor only)
  markAsAnswered: async (classId: number, messageId: number) => {
    const response = await api.patch<{ data: ClassMessage; message: string }>(
      `/classes/${classId}/chat/${messageId}/answered`,
    );
    return response.data;
  },

  // Get question statistics for instructor
  getQuestionStats: async () => {
    const response = await api.get<{ data: QuestionStats }>(
      "/instructor/question-stats",
    );
    return response.data.data;
  },
};

export default classChatApi;
