// API Services Export
export {
  default as supportApi,
  type SupportTicket,
  type SupportReply,
  type TicketStats,
  type CreateTicketData,
} from "./support";
export {
  default as messagesApi,
  type DirectMessage,
  type Conversation,
  type MessageStats,
} from "./messages";
export {
  default as classChatApi,
  type ClassMessage,
  type QuestionStats,
  type SendMessageData,
} from "./classChat";
export { default as usersApi, type User, type UsersResponse } from "./users";
export { default as certificateApi, type Certificate } from "./certificates";
export { coursesApi, type Course, type Enrollment } from "./courses";
export { escalationApi, type EscalationTicket, type EscalationReply, type EscalationStats } from "./escalation";
export { aiAssistantApi } from "./ai-assistant";
export {
  getMoodleSyncStatus,
  runFullSync,
  syncUsers,
  syncCourses,
  syncEnrollments,
  syncCategories,
  getSyncHistory,
} from "./moodleSync";
