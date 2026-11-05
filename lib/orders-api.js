import { getApiBaseUrl } from "@/lib/api-url";

async function requestOrders(path, options = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || "Could not load order information.");
    error.fieldErrors = result.fieldErrors || {};
    throw error;
  }
  return result;
}

export function createOrder(data) {
  return requestOrders("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyOrders() {
  return requestOrders("/api/orders/my-orders");
}

export function getOrder(id) {
  return requestOrders(`/api/orders/${encodeURIComponent(id)}`);
}

export function getAdminOrders(filters = {}) {
  const search = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => Boolean(value)),
  );
  return requestOrders(`/api/admin/orders${search.size ? `?${search}` : ""}`);
}

export function updateOrderStatus(id, status) {
  return requestOrders(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateOrderPaymentStatus(id, paymentStatus) {
  return requestOrders(`/api/admin/orders/${encodeURIComponent(id)}/payment-status`, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
  });
}
