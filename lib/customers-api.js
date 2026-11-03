const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getAdminCustomers(page = 1) {
  const response = await fetch(`${API_BASE_URL}/api/admin/customers?page=${page}`, {
    credentials: "include",
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Could not load customer information.");
  }
  return result;
}
