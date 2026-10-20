"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Menu,
  X,
  ArrowUpRight,
  ShoppingBag,
  UserRound,
  Heart,
  ShoppingCart,
  PackageCheck,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  formatPrice,
  getAttributeValues,
  getProductRouteKey,
  primaryImage,
} from "@/lib/catalog";

export function Header({ categories }) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState(null);
  const [newItemBadges, setNewItemBadges] = useState({});
  const accountRef = useRef(null);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (isPending || !user?.id) return;
    const recordNewItem = (event) => {
      const resource = event.detail?.resource;
      if (resource !== "cart" && resource !== "wishlist") return;
      const key = `${user.id}:${resource}`;
      setNewItemBadges((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }));
    };
    const clearViewedCollectionBadge = (event) => {
      const resource = event.detail?.resource;
      if (resource !== "cart" && resource !== "wishlist") return;
      const key = `${user.id}:${resource}`;
      setNewItemBadges((current) => ({ ...current, [key]: 0 }));
    };
    window.addEventListener("leebazz:account-item-added", recordNewItem);
    window.addEventListener("leebazz:account-collection-viewed", clearViewedCollectionBadge);
    return () => {
      window.removeEventListener("leebazz:account-item-added", recordNewItem);
      window.removeEventListener("leebazz:account-collection-viewed", clearViewedCollectionBadge);
    };
  }, [isPending, user?.id]);

  useEffect(() => {
    if (!accountOpen) return;
    const closeOnOutsideClick = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  const logOut = async () => {
    try {
      await authClient.signOut();
      setAccountOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Log out error:", error);
    }
  };

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const greetingName = displayName
    .split(/\s+/)
    .map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1))
    .join(" ");
  const initials = displayName.slice(0, 1).toUpperCase();
  const cartBadgeKey = user ? `${user.id}:cart` : "";
  const wishlistBadgeKey = user ? `${user.id}:wishlist` : "";
  const newCartItems = newItemBadges[cartBadgeKey] ?? 0;
  const newWishlistItems = newItemBadges[wishlistBadgeKey] ?? 0;

  return (
    <>
      <div className="announcement">
        Thoughtfully chosen for every part of your world <span>✳</span>
      </div>
      <header className="site-header">
        <div className="header-top wrap">
          <button
            className="icon-button mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <Link
            href="/"
            className="wordmark"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            leebazz<span>.</span>
          </Link>
          <nav
            className={`main-nav ${open ? "is-open" : ""}`}
            aria-label="Main navigation"
          >
            <Link
              href="/shop"
              className="nav-all"
              onClick={() => setOpen(false)}
            >
              Shop all
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                onClick={() => setOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <form
              action="/search"
              className="search-box"
              style={{ width: "clamp(110px, 8vw, 140px)" }}
            >
              <Search size={17} />
              <input
                name="q"
                placeholder="Search"
                aria-label="Search products"
              />
              <button aria-label="Submit search">
                <ArrowUpRight size={16} />
              </button>
            </form>
            <Link
              href="/cart"
              className="icon-button header-shop header-count-link"
              aria-label={`Cart${newCartItems ? `, ${newCartItems} new ${newCartItems === 1 ? "item" : "items"}` : ""}`}
            >
              <ShoppingBag />
              {newCartItems > 0 && <span className="header-count-badge" aria-hidden="true">{newCartItems > 99 ? "99+" : newCartItems}</span>}
            </Link>
            <Link
              href="/wishlist"
              className="icon-button header-wishlist header-count-link"
              aria-label={`Wishlist${newWishlistItems ? `, ${newWishlistItems} new ${newWishlistItems === 1 ? "item" : "items"}` : ""}`}
            >
              <Heart />
              {newWishlistItems > 0 && <span className="header-count-badge" aria-hidden="true">{newWishlistItems > 99 ? "99+" : newWishlistItems}</span>}
            </Link>
            {user ? (
              <div className="account-menu" ref={accountRef}>
                <span className="account-name">Hi, {greetingName}!</span>
                <button
                  type="button"
                  className="account-trigger"
                  aria-label={`Account menu for ${displayName}`}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((value) => !value)}
                >
                  <span className="account-avatar" aria-hidden="true">
                    {user.image && user.image !== failedAvatarUrl ? (
                      <Image
                        src={user.image}
                        alt=""
                        width={35}
                        height={35}
                        unoptimized
                        onError={() => setFailedAvatarUrl(user.image)}
                      />
                    ) : <span>{initials}</span>}
                  </span>
                </button>
                {accountOpen && (
                  <nav className="account-dropdown" aria-label="Account menu" role="menu">
                    <div className="account-dropdown-heading">
                      <span>Signed in as</span>
                      <strong>{displayName}</strong>
                    </div>
                    <Link href="/profile" role="menuitem" onClick={() => setAccountOpen(false)}><UserRound size={16} />My profile</Link>
                    <Link href="/cart" role="menuitem" onClick={() => setAccountOpen(false)}><ShoppingCart size={16} />My cart</Link>
                    <Link href="/wishlist" role="menuitem" onClick={() => setAccountOpen(false)}><Heart size={16} />My wishlist</Link>
                    <Link href="/orders" role="menuitem" onClick={() => setAccountOpen(false)}><PackageCheck size={16} />My order</Link>
                    <button type="button" role="menuitem" onClick={logOut}><LogOut size={16} />Log out</button>
                  </nav>
                )}
              </div>
            ) : !isPending ? (
              <>
                <Link href="/login" className="header-login">Login</Link>
                <Link href="/signUp" className="header-signup">Sign up</Link>
              </>
            ) : (
              <span className="account-loading" aria-label="Loading account" />
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export function ProductCard({ product, categoryName }) {
  return (
    <article className="product-card">
      <Link
        href={`/product/${getProductRouteKey(product)}`}
        className="product-image"
      >
        <Image
          src={primaryImage(product)}
          alt={
            product.images.find((image) => image.isPrimary)?.alt ?? product.name
          }
          fill
          sizes="(max-width: 800px) 50vw, (max-width: 1320px) 25vw, 330px"
          loading="lazy"
        />
        <span className="image-arrow">
          <ArrowUpRight size={17} />
        </span>
      </Link>
      <div className="product-meta">
        <span>{categoryName}</span>
        <span>
          {product.isNewArrival
            ? "Just in"
            : product.isFeatured
              ? "Selected"
              : ""}
        </span>
      </div>
      <Link
        className="product-title"
        href={`/product/${getProductRouteKey(product)}`}
      >
        {product.name}
      </Link>
      <div className="product-price">
        {formatPrice(product.price, product.currency)}
      </div>
    </article>
  );
}

export function ProductGrid({ products, categories, filterKeys, query = "" }) {
  const [sort, setSort] = useState("featured");
  const [filters, setFilters] = useState({});
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const filterChoices = useMemo(() => {
    return Object.fromEntries(
      filterKeys.map((key) => {
        const values = products.flatMap((product) =>
          getAttributeValues(product, key),
        );
        return [key, [...new Set(values)]];
      }),
    );
  }, [products, filterKeys]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((product) => {
      const category = categories.find(
        (item) => item.id === product.categoryId,
      );
      const subcategory = category?.subcategories.find(
        (item) => item.id === product.subcategoryId,
      );
      const attributes = Object.values(product.attributes ?? {})
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .join(" ");
      const text =
        `${product.name} ${product.description} ${product.tags.join(" ")} ${attributes} ${category?.name ?? ""} ${subcategory?.name ?? ""}`.toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (!minPrice || product.price >= Number(minPrice)) &&
        (!maxPrice || product.price <= Number(maxPrice)) &&
        Object.entries(filters).every(
          ([key, value]) =>
            !value || getAttributeValues(product, key).includes(value),
        )
      );
    });
    return list.sort((a, b) =>
      sort === "price-low"
        ? a.price - b.price
        : sort === "price-high"
          ? b.price - a.price
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : Number(b.isFeatured) - Number(a.isFeatured),
    );
  }, [products, categories, query, filters, sort, minPrice, maxPrice]);
  return (
    <>
      <div className="catalog-tools">
        <div className="filter-row">
          <SlidersHorizontal size={15} />
          <span>Filter</span>
          {filterKeys
            .filter((key) => key !== "price")
            .map((key) =>
              filterChoices[key]?.length ? (
                <label key={key}>
                  <span className="sr-only">Filter by {key}</span>
                  <select
                    value={filters[key] ?? ""}
                    onChange={(e) =>
                      setFilters({ ...filters, [key]: e.target.value })
                    }
                  >
                    <option value="">{key.replaceAll("-", " ")}</option>
                    {filterChoices[key].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              ) : null,
            )}
          {filterKeys.includes("price") && (
            <div className="price-filter">
              <span>BDT</span>
              <input
                aria-label="Minimum price"
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>–</span>
              <input
                aria-label="Maximum price"
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="sort-row">
          <span>{visible.length} pieces</span>
          <label>
            Sort{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>
      {visible.length ? (
        <div className="product-grid">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={
                categories.find((cat) => cat.id === product.categoryId)?.name ??
                ""
              }
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>Nothing here yet</span>
          <p>No products match those filters. Try adjusting your search.</p>
        </div>
      )}
    </>
  );
}

export function BrandLogo() {
  return (
    <Link href="/" className="brand-lockup" aria-label="Leebazz home">
      <span className="brand-mark-dot" aria-hidden="true" />
    </Link>
  );
}

export function ContactMessageForm({ email }) {
  const [status, setStatus] = useState("");
  function sendMessage(event) {
    event.preventDefault();
    if (!email) {
      setStatus("Contact email is not configured yet.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const subject = String(
      formData.get("subject") ?? "Message from Leebazz website",
    );
    const body = [
      `Name: ${formData.get("name") ?? ""}`,
      `Email: ${formData.get("senderEmail") ?? ""}`,
      "",
      String(formData.get("message") ?? ""),
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Your email app should open with your message ready to send.");
  }

  return (
    <form className="contact-form" onSubmit={sendMessage}>
      <label>
        Name
        <input name="name" autoComplete="name" required />
      </label>
      <label>
        Your email
        <input name="senderEmail" type="email" autoComplete="email" required />
      </label>
      <label>
        Subject
        <input name="subject" required />
      </label>
      <label>
        Message
        <textarea name="message" rows={5} required />
      </label>
      <button className="button button-dark" type="submit" disabled={!email}>
        Prepare email <ArrowUpRight size={16} />
      </button>
      {!email && (
        <p className="form-note">
          Add <code>NEXT_PUBLIC_CONTACT_EMAIL</code> to your local environment
          to enable this form.
        </p>
      )}
      {status && (
        <p className="form-status" role="status">
          {status}
        </p>
      )}
    </form>
  );
}

export function Footer({ categories, products, socialLinks }) {
  const newArrivals = products
    .filter((product) => product.isNewArrival)
    .slice(0, 5);
  return (
    <footer className="site-footer">
      <div className="footer-brand-row wrap">
        <Link href="/" className="wordmark" aria-label="Leebazz home">
          leebazz<span>.</span>
        </Link>
      </div>
      <div className="footer-main wrap">
        <nav className="footer-links footer-new-links" aria-label="What's new">
          <span>What’s new</span>
          {newArrivals.map((product) => (
            <Link
              key={product.id}
              href={`/product/${getProductRouteKey(product)}`}
            >
              {product.name}
            </Link>
          ))}
        </nav>
        <nav className="footer-links" aria-label="Categories">
          <span>Categories</span>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.id}`}>
              {cat.name}
            </Link>
          ))}
        </nav>
        <nav
          className="footer-links footer-customer-service"
          aria-label="Customer service"
        >
          <span>Customer service</span>
          <div className="footer-service-list">
            <div>
              <Link href="/contact">Contact Us</Link>
              <Link href="/how-to-order">How To Order</Link>
              <Link href="/billing-and-payments">Billing &amp; Payments</Link>
              <Link href="/shipping-and-delivery">Shipping &amp; Delivery</Link>
            </div>
            <div>
              <Link href="/track-your-orders">Track Your Orders</Link>
              <Link href="/returns-and-exchanges">Return &amp; Exchanges</Link>
              <Link href="/faq">FAQ</Link>
            </div>
          </div>
        </nav>
        <nav className="footer-links" aria-label="Social media">
          <span>Social</span>
          {socialLinks.map((social) =>
            social.href ? (
              <a
                href={social.href}
                key={social.label}
                target="_blank"
                rel="noreferrer"
              >
                {social.label}
              </a>
            ) : (
              <span className="footer-placeholder" key={social.label}>
                {social.label} · add profile URL
              </span>
            ),
          )}
        </nav>
        <nav className="footer-links" aria-label="Corporate">
          <span>Corporate</span>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
        </nav>
      </div>
      <div className="footer-bottom wrap">
        <span>Demo collection · Prices shown in BDT</span>
      </div>
    </footer>
  );
}
