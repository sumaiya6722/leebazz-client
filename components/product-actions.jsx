"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { requestAccountCollection } from "@/lib/account-api";

export function ProductActions({ productId }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (isPending || !userId) return;
    let active = true;
    Promise.all([
      requestAccountCollection("cart", "GET"),
      requestAccountCollection("wishlist", "GET"),
    ])
      .then(([cart, wishlist]) => {
        if (!active) return;
        setInCart(cart.items.some((item) => item.id === productId));
        setInWishlist(wishlist.items.some((item) => item.id === productId));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isPending, userId, productId]);

  async function toggleWishlist() {
    if (isPending || busy) return;
    if (!session?.user) {
      toast.info("Please log in to save products to your wishlist.");
      return;
    }
    const nextSaved = !inWishlist;
    if (nextSaved && inCart) {
      toast.info("This product is already in your cart and can’t be added to your wishlist.");
      return;
    }
    setBusy("wishlist");
    try {
      await requestAccountCollection("wishlist", nextSaved ? "POST" : "DELETE", { productId });
      setInWishlist(nextSaved);
      toast.success(nextSaved ? "Added to your wishlist." : "Removed from your wishlist.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  }

  async function addToCart() {
    if (isPending || busy) return;
    if (!session?.user) {
      toast.info("Please log in to add products to your cart.");
      return;
    }
    if (inCart) {
      router.push("/cart");
      return;
    }
    setBusy("cart");
    try {
      await requestAccountCollection("cart", "POST", { productId });
      setInCart(true);
      toast.success("Added to your cart.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="product-actions" aria-label="Save or add this product">
      <button
        type="button"
        className={`product-action-button product-action-cart${inCart ? " is-added" : ""}`}
        onClick={addToCart}
        disabled={Boolean(busy) || isPending}
      >
        <ShoppingBag size={17} aria-hidden="true" />
        {busy === "cart" ? "Adding…" : inCart ? "View cart" : "Add to cart"}
      </button>
      <button
        type="button"
        className={`product-action-button product-action-wishlist${inWishlist ? " is-added" : ""}`}
        onClick={toggleWishlist}
        disabled={Boolean(busy) || isPending}
        aria-pressed={inWishlist}
      >
        <Heart size={17} aria-hidden="true" fill={inWishlist ? "currentColor" : "none"} />
        {busy === "wishlist" ? "Saving…" : inWishlist ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    </div>
  );
}
