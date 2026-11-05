export function getApiBaseUrl() {
  if (typeof window !== "undefined") return "/api/backend";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}
