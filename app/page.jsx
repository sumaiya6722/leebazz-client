import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCatalog, getProducts } from "@/lib/catalog";
import { BrandLogo, ProductCard } from "@/components/storefront";
import { HomeBanner } from "@/components/home-banner";

export default async function Home() {
  const [catalog, products] = await Promise.all([getCatalog(), getProducts()]);
  const featured = catalog.homepage.featuredProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p) => p !== undefined)
    .slice(0, 8);
  const bannerSlides = [
    {
      eyebrow: catalog.homepage.hero.eyebrow,
      title: catalog.homepage.hero.title,
      subtitle: catalog.homepage.hero.subtitle,
      image: catalog.homepage.hero.image,
      href: "/shop",
      cta: "Explore the collection",
    },
    ...["women", "men", "jewellery"].flatMap((categoryId) => {
      const category = catalog.categories.find(
        (item) => item.id === categoryId,
      );
      const image = products.find(
        (product) => product.categoryId === categoryId,
      )?.images?.[0]?.url;
      return category && image
        ? [
            {
              eyebrow: "Discover the collection",
              title: category.name,
              subtitle: `Explore considered ${category.name.toLowerCase()} finds for every day.`,
              image,
              href: `/category/${category.id}`,
              cta: `Shop ${category.name}`,
            },
          ]
        : [];
    }),
  ];
  return (
    <main>
      <HomeBanner slides={bannerSlides} />

      <section className="section featured-section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A few favourites</span>
              <h2>Selected for you</h2>
            </div>
            <Link className="text-link" href="/shop">
              View all pieces <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="product-grid featured-product-grid">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={
                  catalog.categories.find((c) => c.id === product.categoryId)
                    ?.name ?? ""
                }
              />
            ))}
          </div>
        </div>
      </section>
      <section
        className="home-category-showcase"
        aria-label="Shop by category"
        style={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        {catalog.categories.map((category, index) => {
          const poster = products.find(
            (product) => product.categoryId === category.id,
          )?.images?.[0]?.url;
          return (
            <article
              className="home-category-panel"
              key={category.id}
              style={{
                width: "100%",
                backgroundImage: poster ? `url(${poster})` : undefined,
              }}
            >
              <video
                className="home-category-video"
                autoPlay
                muted
                loop
                playsInline
                poster={poster}
                preload="metadata"
                aria-hidden="true"
              >
                <source
                  src="https://videos.pexels.com/video-files/4622465/4622465-hd_1920_1080_25fps.mp4"
                  type="video/mp4"
                />
              </video>
              <div className="home-category-shade" />
              <div className="home-category-content">
                <span className="home-category-kicker">
                  0{index + 1} / COLLECTION
                </span>
                <h2>{category.name}</h2>
                <Link
                  className="home-discover-link"
                  href={`/category/${category.id}`}
                >
                  Discover more <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
      <section className="brand-statement wrap">
        <span className="eyebrow">Made for the everyday</span>
        <blockquote>“{catalog.homepage.announcement}.”</blockquote>
        <p className="brand-statement-summary">
          Leebazz brings together clothing for women, men and kids, along with
          home décor, jewellery and skincare. Each piece is thoughtfully
          selected to make it easier to find something special for your everyday
          life, all in one place.
        </p>
        <BrandLogo />
      </section>
    </main>
  );
}
