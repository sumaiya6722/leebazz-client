import { Suspense } from "react";
import { getCatalog, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/storefront";
import { CatalogLoading } from "@/components/catalog-loading";

async function SearchResults({ searchParams }) {
  const { q = "" } = await searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  const [catalog, products] = await Promise.all([getCatalog(), getProducts()]);
  const filterKeys = [
    ...new Set(catalog.categories.flatMap((category) => category.filters)),
  ];
  return (
    <main className="page-shell wrap">
      <div className="page-intro">
        <span className="eyebrow">SEARCH LEEBAZZ</span>
        <h1>
          {query ? (
            <>
              Results for <em>“{query}”</em>
            </>
          ) : (
            "Search the collection"
          )}
        </h1>
        <p>Find a piece across all six Leebazz collections.</p>
      </div>
      <ProductGrid
        products={products}
        categories={catalog.categories}
        filterKeys={filterKeys}
        query={query}
      />
    </main>
  );
}

export default function SearchPage(props) {
  return (
    <Suspense fallback={<CatalogLoading label="search results" />}>
      <SearchResults {...props} />
    </Suspense>
  );
}
