import axios from "@/lib/axios";

export interface Course {
  id: number;
  moodle_course_id: number | null;
  title: string;
  short_name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  instructor_id: number | null;
  image: string | null;
  category_id?: number | null; // Added
  enrollments_count?: number;
  enrollments?: Array<any>; // Added for detail view
  instructor?: {
    id: number;
    name: string;
    avatar: string;
  };
  created_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: "active" | "suspended";
  enrolled_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string;
    department: string;
  };
}

export interface CourseUpdateData {
  title?: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  instructor_id?: number | null;
}

export interface EnrollmentResponse {
  message: string;
  data: Enrollment;
}

export const coursesApi = {
  getAll: async (page = 1) => {
    const response = await axios.get(`/courses?page=${page}`);
    return response.data;
  },
  sync: async (): Promise<{ message: string }> => {
    const response = await axios.post("/courses/sync");
    return response.data;
  },
  getOne: async (id: number | string): Promise<Course> => {
    const response = await axios.get(`/courses/${id}`);
    return response.data;
  },
  update: async (
    id: number | string,
    data: CourseUpdateData,
  ): Promise<Course> => {
    const response = await axios.put(`/courses/${id}`, data);
    return response.data;
  },
  enrollUser: async (
    courseId: number | string,
    userId: number,
    roleId: number = 5,
  ): Promise<EnrollmentResponse> => {
    const response = await axios.post(`/courses/${courseId}/enroll`, {
      user_id: userId,
      role_id: roleId,
    });
    return response.data;
  },
  unenrollUser: async (courseId: number | string, userId: number) => {
    const response = await axios.delete(
      `/courses/${courseId}/enroll/${userId}`,
    );
    return response.data;
  },
  updateEnrollmentRole: async (
    courseId: number | string,
    userId: number,
    roleId: number,
  ) => {
    const response = await axios.patch(
      `/courses/${courseId}/enroll/${userId}/role`,
      { role_id: roleId },
    );
    return response.data;
  },
  getUserProgress: async (courseId: number | string, userId: number) => {
    const response = await axios.get(`/courses/${courseId}/progress/${userId}`);
    return response.data;
  },
};
