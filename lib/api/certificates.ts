import api from "../axios";

export interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  certificate_number: string;
  pdf_path: string;
  pdf_url: string;
  original_filename: string | null;
  is_valid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  course?: { id: number; title: string };
  user?: { id: number; name: string; email: string; employee_id: string };
}

const certificateApi = {
  // User: my certificates
  getMyCertificates: async (): Promise<Certificate[]> => {
    const response = await api.get("/certificates");
    return response.data.data || response.data; // Handle both old and new structure
  },

  // User: download PDF
  download: async (id: number): Promise<Blob> => {
    const response = await api.get(`/certificates/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Admin: upload single PDF for a user
  uploadForUser: async (
    courseId: number,
    userId: number,
    file: File,
  ): Promise<Certificate> => {
    const formData = new FormData();
    formData.append("certificate", file);
    const response = await api.post(
      `/courses/${courseId}/upload-certificate/${userId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.certificate;
  },

  // Admin: bulk upload via ZIP
  uploadBulkZip: async (
    courseId: number,
    file: File,
  ): Promise<{
    matched: string[];
    unmatched: string[];
    total_matched: number;
    total_unmatched: number;
  }> => {
    const formData = new FormData();
    formData.append("zip", file);
    const response = await api.post(
      `/courses/${courseId}/upload-certificates-zip`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  // Admin: all certificates
  getAll: async (params?: {
    course_id?: number;
    user_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await api.get("/admin/certificates", { params });
    return response.data;
  },

  // Admin: revoke
  revoke: async (id: number, notes?: string): Promise<Certificate> => {
    const response = await api.patch(`/admin/certificates/${id}/revoke`, {
      notes,
    });
    return response.data.certificate;
  },
};

export default certificateApi;
