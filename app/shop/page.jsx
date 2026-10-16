import { getCatalog, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/storefront";

export default async function ShopPage() {
  const [catalog, products] = await Promise.all([getCatalog(), getProducts()]);
  const filterKeys = [
    ...new Set(catalog.categories.flatMap((category) => category.filters)),
  ];
  return (
    <main className="page-shell wrap">
      <div className="page-intro">
        <span className="eyebrow">THE FULL COLLECTION</span>
        <h1>Shop all</h1>
        <p>Browse every piece across the Leebazz collection.</p>
      </div>
      <ProductGrid
        products={products}
        categories={catalog.categories}
        filterKeys={filterKeys}
      />
    </main>
  );
}
