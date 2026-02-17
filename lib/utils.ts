import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from "dompurify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify to remove potentially malicious content
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof window === "undefined") {
    // Server-side rendering - return as is (will be sanitized on client)
    return html;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "a", "img", "blockquote", "code", "pre",
      "table", "thead", "tbody", "tr", "th", "td", "div", "span"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Get full URL for storage assets
 */
export const getStorageUrl = (path: string | null): string | null => {
  if (!path) return null;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  return `${baseUrl}/storage/${path}`;
};

/**
 * Get image URL with fallback handling
 * Returns null if path is invalid, component will handle fallback
 */
export const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path || typeof path !== "string") return null;

  // If already a full URL (http/https), return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Otherwise, construct storage URL
  return getStorageUrl(path);
};

/**
 * Format date to Indonesian locale
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Get priority badge color classes
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
