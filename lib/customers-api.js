import { getApiBaseUrl } from "@/lib/api-url";

export async function getAdminCustomers(page = 1) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/customers?page=${page}`, {
    credentials: "include",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Could not load customer information.");
  }
  return result;
}
