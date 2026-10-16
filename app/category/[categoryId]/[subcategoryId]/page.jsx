import Link from "next/link";
import { notFound } from "next/navigation";
import { getCatalog, getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/storefront";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      categoryId: category.id,
      subcategoryId: subcategory.id,
    })),
  );
}

export default async function SubcategoryPage({ params }) {
  const { categoryId, subcategoryId } = await params;
  const [catalog, all] = await Promise.all([getCatalog(), getProducts()]);
  const category = catalog.categories.find((c) => c.id === categoryId);
  const subcategory = category?.subcategories.find(
    (s) => s.id === subcategoryId,
  );
  if (!category || !subcategory) notFound();
  const products = all.filter(
    (p) => p.categoryId === categoryId && p.subcategoryId === subcategoryId,
  );
  return (
    <main className="page-shell wrap">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/category/${category.id}`}>{category.name}</Link>
        <span>/</span>
        <span>{subcategory.name}</span>
      </div>
      <div className="page-intro category-intro">
        <span className="eyebrow">{category.name.toUpperCase()}</span>
        <h1>{subcategory.name}</h1>
        <p>Explore {subcategory.name.toLowerCase()} from Leebazz.</p>
      </div>
      <div className="subcategory-list">
        <Link className="subcategory-chip" href={`/category/${category.id}`}>
          All {category.name}
        </Link>
        {category.subcategories.map((sub) => (
          <Link
            className={`subcategory-chip ${sub.id === subcategoryId ? "active" : ""}`}
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
