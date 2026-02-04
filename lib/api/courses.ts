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
  enrollments_count?: number;
  instructor?: {
    id: number;
    name: string;
    avatar: string;
  };
  // Certificate fields
  certificate_template_id?: number | null;
  passing_grade?: number;
  certificate_criteria?:
    | "final_grade"
    | "specific_quiz"
    | "completion_and_grade";
  certificate_quiz_id?: number | null;
  auto_issue_certificate?: boolean;
  certificate_issue_delay_days?: number;
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
  update: async (id: number | string, data: any): Promise<Course> => {
    const response = await axios.put(`/courses/${id}`, data);
    return response.data;
  },
  enrollUser: async (
    courseId: number | string,
    userId: number,
    roleId: number = 5,
  ): Promise<any> => {
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
};
