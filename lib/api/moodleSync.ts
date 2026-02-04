import api from "@/lib/axios";

export interface SyncStatus {
  connection: {
    status: "connected" | "disconnected";
    moodle_version?: string;
    total_users?: number;
    total_courses?: number;
    database?: string;
    host?: string;
    error?: string;
  };
  stats: {
    portal_users: number;
    portal_courses: number;
    portal_enrollments: number;
    synced_users: number;
    synced_courses: number;
  };
  last_sync: {
    type: string;
    started_at: string;
    completed_at: string;
    duration: number;
    status: string;
  } | null;
}

export interface SyncResult {
  total_moodle?: number;
  added: number;
  updated: number;
  errors?: number;
  skipped?: number;
  duration_seconds: number;
}

export interface FullSyncResult {
  started_at: string;
  completed_at: string;
  duration: number;
  users: SyncResult;
  courses: SyncResult;
  enrollments: SyncResult;
  categories: any;
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

export interface SyncHistory {
  id: number;
  type: string;
  started_at: string;
  completed_at: string;
  status: "success" | "warning" | "error";
  users_added?: number;
  users_updated?: number;
  courses_added?: number;
  courses_updated?: number;
  enrollments_added?: number;
  enrollments_updated?: number;
}

/**
 * Get Moodle sync status & statistics
 */
export const getMoodleSyncStatus = async (): Promise<SyncStatus> => {
  const response = await api.get("/moodle/sync/status");
  return response.data;
};

/**
 * Full sync - sync all data from Moodle
 */
export const runFullSync = async (): Promise<{
  message: string;
  results: FullSyncResult;
}> => {
  const response = await api.post("/moodle/sync/full");
  return response.data;
};

/**
 * Sync users only
 */
export const syncUsers = async (): Promise<{
  message: string;
  results: SyncResult;
}> => {
  const response = await api.post("/moodle/sync/users");
  return response.data;
};

/**
 * Sync courses only
 */
export const syncCourses = async (): Promise<{
  message: string;
  results: SyncResult;
}> => {
  const response = await api.post("/moodle/sync/courses");
  return response.data;
};

/**
 * Sync enrollments only
 */
export const syncEnrollments = async (): Promise<{
  message: string;
  results: SyncResult;
}> => {
  const response = await api.post("/moodle/sync/enrollments");
  return response.data;
};

/**
 * Sync categories only
 */
export const syncCategories = async (): Promise<{
  message: string;
  results: any;
}> => {
  const response = await api.post("/moodle/sync/categories");
  return response.data;
};

/**
 * Get sync history
 */
export const getSyncHistory = async (): Promise<{ history: SyncHistory[] }> => {
  const response = await api.get("/moodle/sync/history");
  return response.data;
};
