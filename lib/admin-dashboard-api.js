import { getApiBaseUrl } from "@/lib/api-url";

export async function getAdminDashboard() {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/dashboard`, {
    credentials: "include",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Could not load dashboard data.");
  }
  return result;
}
