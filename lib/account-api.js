const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function requestAccountCollection(resource, method, data) {
  const response = await fetch(`${API_BASE_URL}/api/account/${resource}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(method === "GET" ? {} : { body: JSON.stringify(data ?? {}) }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Please try again.");
  if (method === "POST" && result.inserted === true && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("leebazz:account-item-added", {
      detail: { resource },
    }));
  }
  return result;
}
