import { getApiBaseUrl } from "@/lib/api-url";

export async function requestAccountCollection(resource, method, data) {
  const response = await fetch(`${getApiBaseUrl()}/api/account/${resource}`, {
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
