// API Services Export
export { default as supportApi, type SupportTicket, type SupportReply, type TicketStats, type CreateTicketData } from './support';
export { default as messagesApi, type DirectMessage, type Conversation, type MessageStats } from './messages';
export { default as classChatApi, type ClassMessage, type QuestionStats, type SendMessageData } from './classChat';

// Re-export User type (commonly used)
export type { User } from './messages';
