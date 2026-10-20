import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCatalog, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/storefront";
import { CatalogLoading } from "@/components/catalog-loading";

export async function generateStaticParams() {
  return (await getCatalog()).categories.map((category) => ({
    categoryId: category.id,
  }));
}

async function CategoryContent({ params }) {
  const { categoryId } = await params;
  const [catalog, all] = await Promise.all([getCatalog(), getProducts()]);
  const category = catalog.categories.find((c) => c.id === categoryId);
  if (!category) notFound();
  const products = all.filter((p) => p.categoryId === categoryId);
  return (
    <main className="page-shell wrap">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>{category.name}</span>
      </div>
      <div className="page-intro category-intro">
        <span className="eyebrow">
          THE {category.name.toUpperCase()} COLLECTION
        </span>
        <h1>{category.name}</h1>
        <p>Explore the collection by category.</p>
      </div>
      <div className="subcategory-list">
        <Link className="subcategory-chip" href={`/category/${category.id}`}>
          All {category.name}
        </Link>
        {category.subcategories.map((sub) => (
          <Link
            className="subcategory-chip"
            key={sub.id}
            href={`/category/${category.id}/${sub.id}`}
          >
            {sub.name}
          </Link>
        ))}
      </div>
      <ProductGrid
        products={products}
        categories={catalog.categories}
        filterKeys={category.filters}
      />
    </main>
  );
}

export default function CategoryPage({ params }) {
  return (
    <Suspense fallback={<CatalogLoading label="category" showBreadcrumbs />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}
