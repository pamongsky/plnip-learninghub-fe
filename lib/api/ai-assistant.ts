import api from '../axios';

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
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIChatResponse {
  response: string;
  timestamp: string;
}

export const aiAssistantApi = {
  /**
   * Get AI context (menu structure, features available to user)
   */
  getContext: async (): Promise<AIContext> => {
    const response = await api.get<{ data: AIContext }>('/ai-assistant/context');
    return response.data.data;
  },

  /**
   * Send message to AI assistant
   */
  chat: async (message: string, conversationId?: string): Promise<AIChatResponse> => {
    console.log('=== AI Chat API Call ===');
    console.log('Message:', message);
    console.log('Conversation ID:', conversationId);
    
    try {
      const response = await api.post<{ data: AIChatResponse }>('/ai-assistant/chat', {
        message,
        conversation_id: conversationId,
      });
      
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', response.data);
      
      if (!response.data.data) {
        console.error('No data in response!', response.data);
        throw new Error('No data in API response');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('AI Chat API Error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Get course content for AI learning assistance
   */
  getCourseContent: async (courseId: number) => {
    const response = await api.get(`/ai-assistant/course/${courseId}/content`);
    return response.data.data;
  },
};
