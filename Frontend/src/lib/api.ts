export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$|\s+$/g, "") ?? "";

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}
