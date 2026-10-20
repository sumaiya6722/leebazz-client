"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { formatPrice, getProductRouteKey, primaryImage } from "@/lib/catalog";
import { requestAccountCollection } from "@/lib/account-api";

export function AccountCollection({ kind }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyProduct, setBusyProduct] = useState("");
  const isCart = kind === "cart";
  const title = isCart ? "Your cart" : "Your wishlist";
  const Icon = isCart ? ShoppingBag : Heart;

  useEffect(() => {
    if (isPending) return;
    if (!userId) return;
    let active = true;
    requestAccountCollection(kind, "GET")
      .then(({ items: savedItems }) => {
        if (active) setItems(savedItems);
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

  async function removeItem(productId) {
    setBusyProduct(productId);
    try {
      await requestAccountCollection(kind, "DELETE", { productId });
      setItems((current) => current.filter((item) => item.id !== productId));
      toast.success(isCart ? "Removed from your cart." : "Removed from your wishlist.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyProduct("");
    }
  }

  async function changeQuantity(item, quantity) {
    if (quantity < 1 || quantity > 99) return;
    setBusyProduct(item.id);
    try {
      await requestAccountCollection("cart", "PATCH", { productId: item.id, quantity });
      setItems((current) => current.map((saved) => saved.id === item.id ? { ...saved, quantity } : saved));
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
              <article className="account-product-row" key={item.id}>
                <Link href={`/product/${getProductRouteKey(item)}`} className="account-product-photo" aria-label={`View ${item.name}`}>
                  <Image src={primaryImage(item)} alt={item.images.find((image) => image.isPrimary)?.alt ?? item.name} fill sizes="(max-width: 600px) 30vw, 140px" />
                </Link>
                <div className="account-product-info">
                  <span className="eyebrow">{item.categoryId}</span>
                  <Link className="account-product-name" href={`/product/${getProductRouteKey(item)}`}>{item.name}</Link>
                  <span className="account-product-price">{formatPrice(item.price, item.currency)}</span>
                  {isCart && (
                    <div className="cart-quantity" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" aria-label="Decrease quantity" disabled={busyProduct === item.id || item.quantity <= 1} onClick={() => changeQuantity(item, item.quantity - 1)}><Minus size={13} /></button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label="Increase quantity" disabled={busyProduct === item.id || item.quantity >= 99} onClick={() => changeQuantity(item, item.quantity + 1)}><Plus size={13} /></button>
                    </div>
                  )}
                </div>
                <div className="account-product-end">
                  {isCart && <strong>{formatPrice(item.price * item.quantity, item.currency)}</strong>}
                  <button className="account-remove" type="button" disabled={busyProduct === item.id} onClick={() => removeItem(item.id)}>
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
