"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteAdminProduct, getAdminCatalog, updateAdminProduct } from "@/lib/products-api";
import { formatPrice, primaryImage } from "@/lib/catalog";

export function AdminProducts() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyProductId, setBusyProductId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    getAdminCatalog()
      .then((result) => {
        if (!active) return;
        setCategories(result.categories);
        setProducts(result.products);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function updateVariantStock(productId, variantSku, stock) {
    setProducts((current) => current.map((product) => product.id !== productId
      ? product
      : {
          ...product,
          variants: product.variants.map((variant) => variant.sku === variantSku
            ? { ...variant, stock }
            : variant),
        }));
  }

  function updateNewArrival(productId, isNewArrival) {
    setProducts((current) => current.map((product) => product.id === productId
      ? { ...product, isNewArrival }
      : product));
  }

  async function saveProduct(product, variants = product.variants, successMessage = "Product updated.") {
    if (busyProductId) return;
    if (variants.some((variant) => !Number.isInteger(variant.stock) || variant.stock < 0 || variant.stock > 99999)) {
      toast.error("Enter a whole-number quantity between 0 and 99,999 for every variant.");
      return;
    }

    setBusyProductId(product.id);
    try {
      const result = await updateAdminProduct(product.id, {
        isNewArrival: product.isNewArrival,
        variants: variants.map(({ sku, stock }) => ({ sku, stock })),
      });
      setProducts((current) => current.map((item) => item.id === product.id ? result.product : item));
      toast.success(successMessage);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusyProductId("");
    }
  }

  async function deleteProduct(product) {
    if (busyProductId) return;
    if (!window.confirm(`Delete "${product.name}" from the storefront?`)) return;
    setBusyProductId(product.id);
    try {
      await deleteAdminProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast.success("Product deleted from the storefront.");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusyProductId("");
    }
  }

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleCategories = categories.flatMap((category) => {
    const categoryProducts = products.filter((product) => product.categoryId === category.id);
    const categoryMatches = category.name.toLocaleLowerCase().includes(normalizedSearch);
    const matchingProducts = normalizedSearch && !categoryMatches
      ? categoryProducts.filter((product) =>
          `${product.name} ${product.id}`.toLocaleLowerCase().includes(normalizedSearch),
        )
      : categoryProducts;
    return matchingProducts.length ? [{ ...category, products: matchingProducts }] : [];
  });
  const matchingProductCount = visibleCategories.reduce(
    (total, category) => total + category.products.length,
    0,
  );

  return (
    <main className="admin-page admin-products-page">
      <header className="admin-page-heading">
        <div>
          <span className="eyebrow">CATALOG MANAGEMENT</span>
          <h1>Products</h1>
          <p>Update stock and new-arrival status. Changes appear on the storefront immediately.</p>
        </div>
        <span className="admin-demo-badge">{products.length} PRODUCTS</span>
      </header>

      {loading ? (
        <p className="admin-products-state" role="status">Loading products…</p>
      ) : error ? (
        <p className="admin-products-state is-error" role="alert">{error}</p>
      ) : products.length === 0 ? (
        <p className="admin-products-state">There are no products to manage.</p>
      ) : (
        <>
          <div className="admin-product-search">
            <label htmlFor="admin-product-search"><Search size={17} aria-hidden="true" />Search products or categories</label>
            <div className="admin-product-search-control">
              <input
                id="admin-product-search"
                type="search"
                placeholder="Try “Women”, “Skincare” or a product name"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear product search">
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>
            <span className="admin-product-search-count">{matchingProductCount} of {products.length} products</span>
          </div>
          {visibleCategories.length === 0 ? (
            <p className="admin-products-state">No products or categories match “{search}”.</p>
          ) : visibleCategories.map((category) => {
          const categoryProducts = category.products;
          return (
            <section className="admin-product-category" key={category.id} aria-labelledby={`admin-category-${category.id}`}>
              <header className="admin-product-category-heading">
                <h2 id={`admin-category-${category.id}`}>{category.name}</h2>
                <span>{categoryProducts.length} products</span>
              </header>
              <div className="admin-product-list">
                {categoryProducts.map((product) => {
                  const saving = busyProductId === product.id;
                  return (
                    <article className="admin-product-item" key={product.id}>
                      <div className="admin-product-summary">
                        <div className="admin-product-image">
                          <Image src={primaryImage(product)} alt="" fill sizes="72px" />
                        </div>
                        <div>
                          <h3>{product.name}</h3>
                          <p>{product.id} · {formatPrice(product.price, product.currency)}</p>
                        </div>
                      </div>
                      <div className="admin-product-variants" role="group" aria-label={`Stock quantities for ${product.name}`}>
                        {product.variants.map((variant) => (
                          <label className="admin-product-quantity" key={variant.sku}>
                            <span>{variant.label}</span>
                            <input
                              type="number"
                              min="0"
                              max="99999"
                              step="1"
                              value={variant.stock}
                              disabled={Boolean(busyProductId)}
                              onChange={(event) => updateVariantStock(
                                product.id,
                                variant.sku,
                                event.currentTarget.value === "" ? "" : Number(event.currentTarget.value),
                              )}
                            />
                          </label>
                        ))}
                      </div>
                      <div className="admin-product-controls">
                        <label className="admin-new-arrival">
                          <input
                            type="checkbox"
                            checked={Boolean(product.isNewArrival)}
                            disabled={Boolean(busyProductId)}
                            onChange={(event) => updateNewArrival(product.id, event.currentTarget.checked)}
                          />
                          New arrival
                        </label>
                        <div className="admin-product-actions">
                          <button
                            type="button"
                            className="button button-dark"
                            disabled={Boolean(busyProductId)}
                            onClick={() => saveProduct(product)}
                          >
                            {saving ? "Saving…" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            className="admin-product-secondary"
                            disabled={Boolean(busyProductId)}
                            onClick={() => saveProduct(
                              product,
                              product.variants.map((variant) => ({ ...variant, stock: 0 })),
                              "Product marked as out of stock.",
                            )}
                          >
                            Mark out of stock
                          </button>
                          <button
                            type="button"
                            className="admin-product-delete"
                            disabled={Boolean(busyProductId)}
                            onClick={() => deleteProduct(product)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
          })}
        </>
      )}
    </main>
  );
}
