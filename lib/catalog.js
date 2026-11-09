import { cache } from "react";
import source from "../public/leebazz-import-ready-catalog-final.json";
import { getPublicCatalog } from "@/lib/products-api";

const loadCatalog = cache(getPublicCatalog);

export const fallbackCategories = source.categories;

export async function getCatalog() {
  const catalog = await loadCatalog();
  if (Array.isArray(catalog?.categories)) return catalog;

  console.warn(
    "Public catalog response did not include categories; using bundled catalog categories.",
  );
  return { ...catalog, categories: fallbackCategories };
}

export async function getProducts() {
  const catalog = await getCatalog();
  return catalog.products;
}

export async function getProduct(slug) {
  return (await getProducts()).find(
    (product) => getProductRouteKey(product) === slug,
  );
}

export function getProductRouteKey(product) {
  const matchingSlugs = source.products.filter(
    (candidate) => candidate.slug === product.slug,
  );
  return matchingSlugs.length > 1
    ? `${product.slug}-${product.id.toLowerCase()}`
    : product.slug;
}

export function getAttributeValues(product, key) {
  const attributes = product.attributes ?? {};

  const value =
    key === "size"
      ? attributes.sizes
      : key === "volume"
        ? attributes.volumeMl
        : attributes[key];

  const values = Array.isArray(value)
    ? value
    : value === undefined || value === null || value === ""
      ? []
      : [value];

  const formatted = values.map((item) =>
    key === "volume" && typeof item === "number" ? `${item} ml` : String(item),
  );
  if (key === "size" || key === "volume") {
    formatted.push(...product.variants.map((variant) => variant.label));
  }
  return [...new Set(formatted)];
}

export function getCategoryName(categoryId, catalog) {
  return (
    catalog.categories.find((category) => category.id === categoryId)?.name ??
    categoryId
  );
}

export function formatPrice(price, currency = "BDT") {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function primaryImage(product) {
  return (
    product.images.find((image) => image.isPrimary)?.url ??
    product.images[0]?.url ??
    ""
  );
}
