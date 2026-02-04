import api from "../axios";

export interface CertificateTemplate {
  id: number;
  name: string;
  category: string | null;
  file_path: string;
  preview_path: string | null;
  variables: Record<string, string>;
  settings: Record<string, any>;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  template_id: number | null;
  certificate_number: string;
  course_name: string;
  student_name: string;
  completion_date: string;
  issue_date: string;
  final_score: number;
  grade: string;
  total_hours: number;
  instructor_name: string | null;
  certificate_url: string;
  verification_code: string;
  is_valid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  course?: {
    id: number;
    title: string;
  };
  template?: {
    id: number;
    name: string;
  };
}

export interface CertificateStats {
  total: number;
  valid: number;
  revoked: number;
  this_month: number;
  by_course: Array<{
    course_id: number;
    course_name: string;
    total: number;
  }>;
}

const certificateTemplateApi = {
  // Get all templates
  getAll: async (params?: {
    category?: string;
    active_only?: boolean;
  }): Promise<CertificateTemplate[]> => {
    const response = await api.get("/certificate-templates", { params });
    return response.data;
  },

  // Get single template
  getOne: async (id: number): Promise<CertificateTemplate> => {
    const response = await api.get(`/certificate-templates/${id}`);
    return response.data;
  },

  // Get available variables
  getVariables: async (): Promise<Record<string, string>> => {
    const response = await api.get("/certificate-templates/variables");
    return response.data.variables;
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get("/certificate-templates/categories");
    return response.data;
  },

  // Create template
  create: async (data: FormData): Promise<CertificateTemplate> => {
    const response = await api.post("/certificate-templates", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.template;
  },

  // Update template
  update: async (id: number, data: FormData): Promise<CertificateTemplate> => {
    const response = await api.post(`/certificate-templates/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.template;
  },

  // Delete template
  delete: async (id: number): Promise<void> => {
    await api.delete(`/certificate-templates/${id}`);
  },
};

const certificateApi = {
  // User: Get my certificates
  getMyCertificates: async (): Promise<Certificate[]> => {
    const response = await api.get("/certificates");
    return response.data;
  },

  // User: Get single certificate
  getOne: async (id: number): Promise<Certificate> => {
    const response = await api.get(`/certificates/${id}`);
    return response.data;
  },

  // User: Download certificate
  download: async (id: number): Promise<Blob> => {
    const response = await api.get(`/certificates/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Public: Verify certificate
  verify: async (
    verificationCode: string,
  ): Promise<{
    valid: boolean;
    message: string;
    certificate?: Certificate;
  }> => {
    const response = await api.get("/certificates/verify", {
      params: { verification_code: verificationCode },
    });
    return response.data;
  },

  // Admin: Get all certificates
  getAll: async (params?: {
    course_id?: number;
    user_id?: number;
    is_valid?: boolean;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: Certificate[];
    total: number;
    current_page: number;
    last_page: number;
  }> => {
    const response = await api.get("/admin/certificates", { params });
    return response.data;
  },

  // Admin: Get statistics
  getStats: async (): Promise<CertificateStats> => {
    const response = await api.get("/admin/certificates/stats");
    return response.data;
  },

  // Admin: Revoke certificate
  revoke: async (id: number, notes?: string): Promise<Certificate> => {
    const response = await api.patch(`/admin/certificates/${id}/revoke`, {
      notes,
    });
    return response.data.certificate;
  },

  // Admin: Restore certificate
  restore: async (id: number): Promise<Certificate> => {
    const response = await api.patch(`/admin/certificates/${id}/restore`);
    return response.data.certificate;
  },
};

export { certificateTemplateApi, certificateApi };
