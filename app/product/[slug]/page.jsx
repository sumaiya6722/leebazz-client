import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  getCatalog,
  getProduct,
  getProducts,
  getProductRouteKey,
  formatPrice,
  primaryImage,
} from "@/lib/catalog";
import { ProductCard } from "@/components/storefront";

export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({
    slug: getProductRouteKey(product),
  }));
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [catalog, product, all] = await Promise.all([
    getCatalog(),
    getProduct(slug),
    getProducts(),
  ]);
  if (!product) notFound();
  const category = catalog.categories.find(
    (item) => item.id === product.categoryId,
  );
  if (!category) notFound();
  const similar = all
    .filter(
      (item) =>
        item.categoryId === product.categoryId && item.id !== product.id,
    )
    .slice(0, 4);
  const values = Object.entries(product.attributes ?? {});
  return (
    <main className="wrap detail-page">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/category/${category.id}`}>{category.name}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="detail-layout">
        <div className="detail-photo">
          <img
            src={primaryImage(product)}
            alt={
              product.images.find((image) => image.isPrimary)?.alt ??
              product.name
            }
          />
          <span>LEebazz / {product.id}</span>
        </div>
        <section className="detail-info">
          <span className="eyebrow">
            {category.name} /{" "}
            {
              category.subcategories.find(
                (sub) => sub.id === product.subcategoryId,
              )?.name
            }
          </span>
          <h1>{product.name}</h1>
          <div className="detail-price">
            {formatPrice(product.price, product.currency)}
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-rule" />
          <span className="detail-label">Details</span>
          <dl className="attributes">
            {values.map(([key, value]) => (
              <div key={key}>
                <dt>{key.replaceAll("-", " ")}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
          {product.variants.length > 1 && (
            <div className="variant-block">
              <span className="detail-label">Available options</span>
              <div className="variant-list">
                {product.variants.map((variant) => (
                  <span key={variant.sku}>{variant.label}</span>
                ))}
              </div>
            </div>
          )}
          <p className="demo-note">
            Sample catalog listing. Product details and images are provided for
            demonstration.
          </p>
          <Link className="back-link" href={`/category/${category.id}`}>
            <ArrowLeft size={15} /> Back to {category.name}
          </Link>
        </section>
      </div>
      {similar.length > 0 && (
        <section className="section related-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Keep exploring</span>
              <h2>More from {category.name}</h2>
            </div>
            <Link className="text-link" href={`/category/${category.id}`}>
              View collection <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {similar.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                categoryName={category.name}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
