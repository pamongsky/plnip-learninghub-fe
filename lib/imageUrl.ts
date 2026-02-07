/**
 * Convert storage path to full URL
 * @param path - Path from database (e.g., "/storage/cms/logo.jpg")
 * @returns Full URL (e.g., "http://192.168.4.177:8000/storage/cms/logo.jpg")
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";

  // If already full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If relative path, construct full URL
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  // Remove leading slash if exists (backend URL already has it)
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${backendUrl}${cleanPath}`;
}
