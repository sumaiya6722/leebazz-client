const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function requestProducts(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Could not load product information.");
  }
  return result;
}

export function getPublicCatalog() {
  return requestProducts("/api/products");
}

export function getAdminCatalog() {
  return requestProducts("/api/admin/products");
}

export function updateAdminProduct(id, product) {
  return requestProducts(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(product),
  });
}

export function deleteAdminProduct(id) {
  return requestProducts(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
