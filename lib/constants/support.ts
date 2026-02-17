/**
 * Shared Support Ticket Categories
 * Single source of truth for support ticket categories across the application
 */

export const SUPPORT_CATEGORIES = {
  technical: {
    value: "technical",
    label: "Masalah Teknis",
    icon: "🔧",
    description: "Masalah teknis seperti error, bug, atau kendala sistem",
  },
  learning: {
    value: "learning",
    label: "Masalah Pembelajaran",
    icon: "📚",
    description: "Kesulitan dalam mengakses materi atau memahami konten pembelajaran",
  },
  certificate: {
    value: "certificate",
    label: "Masalah Sertifikat",
    icon: "🏆",
    description: "Pertanyaan atau masalah terkait sertifikat pelatihan",
  },
  other: {
    value: "other",
    label: "Lainnya",
    icon: "💬",
    description: "Pertanyaan atau masalah lain yang tidak termasuk kategori di atas",
  },
} as const;

export type SupportCategoryValue = keyof typeof SUPPORT_CATEGORIES;

export const getSupportCategoryLabel = (value: string): string => {
  return SUPPORT_CATEGORIES[value as SupportCategoryValue]?.label || value;
};

export const getSupportCategoryIcon = (value: string): string => {
  return SUPPORT_CATEGORIES[value as SupportCategoryValue]?.icon || "💬";
};
