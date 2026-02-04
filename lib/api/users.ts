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
    const users = response.data?.data || response.data || [];

    // Map backend fields to frontend expected fields
    return users.map((user: any) => ({
      ...user,
      role_name: user.role || user.effective_role || "user",
      status: user.is_active ? "active" : "inactive",
    }));
  },
};

export default usersApi;
