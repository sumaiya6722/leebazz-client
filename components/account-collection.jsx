"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { formatPrice, getProductRouteKey, primaryImage } from "@/lib/catalog";
import { requestAccountCollection } from "@/lib/account-api";

function getCartDetails(item) {
  const attributes = item.attributes ?? {};
  const valueFor = (...keys) => {
    const key = keys.find((candidate) => attributes[candidate] !== undefined && attributes[candidate] !== "");
    const value = key ? attributes[key] : "";
    return Array.isArray(value) ? value.join(", ") : value;
  };
  const details = [];
  if (["women", "men", "kids"].includes(item.categoryId)) {
    if (item.selectedVariant?.label) details.push(["Size", item.selectedVariant.label]);
    const color = valueFor("colour", "color");
    if (color) details.push(["Color", color]);
    const fabric = valueFor("fabric");
    if (fabric) details.push(["Fabric", fabric]);
  } else if (["home-decor", "jewellery"].includes(item.categoryId)) {
    const color = valueFor("colour", "color");
    if (color) details.push(["Color", color]);
    const material = valueFor("material");
    if (material) details.push(["Material", material]);
  } else if (item.categoryId === "skincare") {
    const volume = valueFor("volumeMl", "volume");
    const variantVolume = item.selectedVariant?.label;
    if (volume) details.push(["Volume", `${volume}${typeof attributes.volumeMl === "number" ? " ml" : ""}`]);
    else if (variantVolume) details.push(["Volume", variantVolume]);
    const skinType = valueFor("skinType", "skin-type");
    if (skinType) details.push(["Skin type", skinType]);
  }
  return details;
}

export function AccountCollection({ kind }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyProduct, setBusyProduct] = useState("");
  const isCart = kind === "cart";
  const title = isCart ? "Your cart" : "Your wishlist";
  const Icon = isCart ? ShoppingBag : Heart;

  useEffect(() => {
    if (isPending) return;
    if (!userId) return;
    let active = true;
    Promise.all([
      requestAccountCollection(kind, "GET"),
      kind === "wishlist"
        ? requestAccountCollection("cart", "GET")
        : Promise.resolve({ items: [] }),
    ])
      .then(([{ items: savedItems }, { items: savedCartItems }]) => {
        if (active) setItems(savedItems);
        if (active) setCartItems(savedCartItems);
      })
      .catch((error) => {
        if (active) toast.error(error.message);
      })
      .finally(() => {
        if (!active) return;
        window.dispatchEvent(new CustomEvent("leebazz:account-collection-viewed", {
          detail: { resource: kind },
        }));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isPending, userId, kind]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [items],
  );

  function getSelectedSku(item) {
    const variants = item.variants ?? [];
    return selectedVariants[item.id] ?? (variants.length === 1 ? variants[0].sku : "");
  }

  function isItemInCart(item) {
    const selectedSku = getSelectedSku(item);
    return Boolean(selectedSku) && cartItems.some(
      (cartItem) => cartItem.id === item.id && cartItem.selectedVariant?.sku === selectedSku,
    );
  }

  async function removeItem(item) {
    const itemKey = item.cartItemId || item.id;
    setBusyProduct(itemKey);
    try {
      await requestAccountCollection(kind, "DELETE", { productId: item.id, variantSku: item.selectedVariant?.sku });
      setItems((current) => current.filter((saved) => (saved.cartItemId || saved.id) !== itemKey));
      toast.success(isCart ? "Removed from your cart." : "Removed from your wishlist.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyProduct("");
    }
  }

  async function changeQuantity(item, quantity) {
    if (quantity < 1 || quantity > 99) return;
    const itemKey = item.cartItemId || item.id;
    setBusyProduct(itemKey);
    try {
      await requestAccountCollection("cart", "PATCH", { productId: item.id, variantSku: item.selectedVariant?.sku, quantity });
      setItems((current) => current.map((saved) => (saved.cartItemId || saved.id) === itemKey ? { ...saved, quantity } : saved));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyProduct("");
    }
  }

  async function addToCart(item) {
    const variants = item.variants ?? [];
    const selectedSku = getSelectedSku(item);
    if (isItemInCart(item)) {
      router.push("/cart");
      return;
    }
    if (variants.length > 1 && !selectedSku) {
      toast.info("Choose a size before adding this product to your cart.");
      return;
    }

    const itemKey = `${item.id}:${selectedSku}`;
    if (busyProduct) {
      return;
    }

    setBusyProduct(itemKey);
    try {
      await requestAccountCollection("cart", "POST", {
        productId: item.id,
        variantSku: selectedSku || undefined,
      });
      const selectedVariant = variants.find((variant) => variant.sku === selectedSku);
      setCartItems((current) => [...current, { ...item, selectedVariant }]);
      toast.success("Added to your cart.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyProduct("");
    }
  }

  return (
    <main className="account-collection wrap">
      <div className="account-collection-heading">
        <span className="eyebrow">Your Leebazz account</span>
        <h1><Icon size={27} strokeWidth={1.4} aria-hidden="true" />{title}</h1>
        <p>{isCart ? "Your selected pieces are gathered here." : "Keep the pieces you love close at hand."}</p>
      </div>

      {isPending || (Boolean(session?.user) && loading) ? (
        <div className="account-collection-skeleton" aria-busy="true" aria-label={`Loading ${title}`}>
          <span className="sr-only" role="status">Loading {title}…</span>
          {Array.from({ length: 3 }, (_, index) => (
            <div className="account-row-skeleton" key={index}>
              <span className="skeleton-block" />
              <span className="skeleton-line" />
              <span className="skeleton-line" />
            </div>
          ))}
        </div>
      ) : !session?.user ? (
        <div className="account-collection-empty">
          <p>Log in to see your saved {isCart ? "cart" : "wishlist"}.</p>
          <Link className="button button-dark" href="/login">Log in</Link>
        </div>
      ) : items.length === 0 ? (
        <div className="account-collection-empty">
          <span className="account-empty-icon"><Icon size={25} strokeWidth={1.4} /></span>
          <h2>{isCart ? "Your cart is waiting" : "Your wishlist is waiting"}</h2>
          <p>{isCart ? "Explore the collection and add something you love." : "Save your favourite finds and come back to them anytime."}</p>
          <Link className="button button-dark" href="/shop">Explore the collection</Link>
        </div>
      ) : (
        <div className="account-collection-content">
          <div className="account-collection-items">
            {items.map((item) => (
              <article className={`account-product-row${isCart ? "" : " wishlist-product-row"}`} key={item.cartItemId || item.id}>
                <Link href={`/product/${getProductRouteKey(item)}`} className="account-product-photo" aria-label={`View ${item.name}`}>
                  <Image src={primaryImage(item)} alt={item.images.find((image) => image.isPrimary)?.alt ?? item.name} fill sizes="(max-width: 600px) 30vw, 140px" />
                </Link>
                <div className="account-product-info">
                  <span className="eyebrow">{item.categoryId}</span>
                  <Link className="account-product-name" href={`/product/${getProductRouteKey(item)}`}>{item.name}</Link>
                  <span className="account-product-price">{formatPrice(item.price, item.currency)}</span>
                  {getCartDetails(item).length > 0 && <ul className={`cart-specs cart-specs-${item.categoryId}`} aria-label="Product details">
                    {getCartDetails(item).map(([label, value]) => <li key={label}><span className="cart-spec-label">{label}</span><strong className="cart-spec-value">{value}</strong></li>)}
                  </ul>}
                  {!isCart && (item.variants?.length ?? 0) > 1 && (
                    <label className="wishlist-variant-picker">
                      <span>Choose a size</span>
                      <select
                        aria-label={`Choose a size for ${item.name}`}
                        value={selectedVariants[item.id] ?? ""}
                        onChange={(event) => setSelectedVariants((current) => ({ ...current, [item.id]: event.target.value }))}
                      >
                        <option value="">Select size</option>
                        {item.variants.map((variant) => <option key={variant.sku} value={variant.sku}>{variant.label}</option>)}
                      </select>
                    </label>
                  )}
                  {isCart && (
                    <div className="cart-quantity" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" aria-label="Decrease quantity" disabled={busyProduct === (item.cartItemId || item.id) || item.quantity <= 1} onClick={() => changeQuantity(item, item.quantity - 1)}><Minus size={13} /></button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label="Increase quantity" disabled={busyProduct === (item.cartItemId || item.id) || item.quantity >= 99} onClick={() => changeQuantity(item, item.quantity + 1)}><Plus size={13} /></button>
                    </div>
                  )}
                </div>
                <div className="account-product-end">
                  {isCart && <strong>{formatPrice(item.price * item.quantity, item.currency)}</strong>}
                  {!isCart && (
                    <button
                      className="wishlist-add-to-cart"
                      type="button"
                      disabled={Boolean(busyProduct) || ((item.variants?.length ?? 0) > 1 && !selectedVariants[item.id])}
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingBag size={14} aria-hidden="true" />
                      {busyProduct.startsWith(`${item.id}:`)
                        ? "Adding…"
                        : isItemInCart(item)
                          ? "View in cart"
                          : (item.variants?.length ?? 0) > 1 && !getSelectedSku(item)
                            ? "Choose a size"
                            : "Add to cart"}
                    </button>
                  )}
                  <button className="account-remove" type="button" disabled={busyProduct === (item.cartItemId || item.id)} onClick={() => removeItem(item)}>
                    <Trash2 size={15} />Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          {isCart && (
            <aside className="cart-summary">
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
              <p>Shipping and delivery details are confirmed at checkout.</p>
            </aside>
          )}
        </div>
      )}
    </main>
  );
}
