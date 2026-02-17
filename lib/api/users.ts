import api from "../axios";

export interface User {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  position: string;
  role: string; // dari backend
  role_name?: string; // alias untuk kompatibilitas
  effective_role: string;
  is_active: boolean;
  status?: string; // computed field
  source: string;
  access_group?: string;
  role_override?: string;
  created_at: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

const usersApi = {
  // Get all users with filters
  getAll: async (params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<UsersResponse> => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // Get all users without pagination (for admin view)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get("/users/all");
    // Backend returns {success, data, total} format
    const users = (response.data?.data || response.data || []) as Partial<User>[];

    // Map backend fields to frontend expected fields
    return users.map((user) => ({
      id: user.id || 0,
      name: user.name || "",
      email: user.email || "",
      employee_id: user.employee_id || "",
      department: user.department || "",
      position: user.position || "",
      role: user.role || "learner",
      role_name: user.role || user.effective_role || "learner",
      effective_role: user.effective_role || user.role || "learner",
      is_active: user.is_active ?? true,
      status: user.is_active ? "active" : "inactive",
      source: user.source || "manual",
      access_group: user.access_group,
      role_override: user.role_override,
      created_at: user.created_at || new Date().toISOString(),
    }));
  },
};

export default usersApi;
