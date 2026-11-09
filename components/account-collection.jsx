"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { formatPrice, getProductRouteKey, primaryImage } from "@/lib/catalog";
import { requestAccountCollection } from "@/lib/account-api";
import { createOrder } from "@/lib/orders-api";

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

function validateCheckoutAddress(address) {
  const errors = {};
  const name = address.name.trim();
  const phone = address.phone.trim().replace(/[\s()-]/g, "");
  const addressLine = address.addressLine.trim();
  const city = address.city.trim();

  if (name.length < 2 || name.length > 100) {
    errors.name = "Enter a name between 2 and 100 characters.";
  }
  if (!/^(?:\+?8801[3-9]\d{8}|01[3-9]\d{8})$/.test(phone)) {
    errors.phone = "Enter a valid Bangladesh mobile number, such as 01XXXXXXXXX or +8801XXXXXXXXX.";
  }
  if (addressLine.length < 5 || addressLine.length > 250) {
    errors.addressLine = "Enter a complete house/road and area.";
  }
  if (city.length < 2 || city.length > 100) {
    errors.city = "Enter a city or area between 2 and 100 characters.";
  }
  if (address.postalCode.trim().length > 20) {
    errors.postalCode = "Postal code must be 20 characters or fewer.";
  }
  return errors;
}

const checkoutFieldIds = {
  name: "checkout-name",
  phone: "checkout-phone",
  addressLine: "checkout-address",
  city: "checkout-city",
  postalCode: "checkout-postal-code",
};

const checkoutFieldLabels = {
  name: "Full name",
  phone: "Bangladesh mobile number",
  addressLine: "House/road and area",
  city: "City / area",
  postalCode: "Postal code",
};

function focusFirstCheckoutError(errors) {
  const field = Object.keys(checkoutFieldIds).find((key) => errors[key]);
  if (field) {
    window.requestAnimationFrame(() => {
      document.getElementById(checkoutFieldIds[field])?.focus();
    });
  }
}

export function AccountCollection({ kind }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState("");
  const [selectedVariants, setSelectedVariants] = useState({});
  const [loading, setLoading] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [busyProduct, setBusyProduct] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addressUserId, setAddressUserId] = useState(userId || "");
  const [address, setAddress] = useState({
    name: session?.user?.name || "",
    phone: "",
    addressLine: "",
    city: "",
    postalCode: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const idempotencyKey = useRef("");
  const isCart = kind === "cart";
  const title = isCart ? "Your cart" : "Your wishlist";
  const Icon = isCart ? ShoppingBag : Heart;
  const checkoutAddress = addressUserId === userId
    ? address
    : { name: session?.user?.name || "", phone: "", addressLine: "", city: "", postalCode: "" };

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
      .then(([savedCollection, savedCart]) => {
        if (active) setItems(savedCollection.items);
        if (active) setCartItems(savedCart.items);
        if (active && isCart) setDeliveryFee(savedCollection.deliveryFee || 0);
        if (active) setLoadedUserId(userId);
      })
      .catch((error) => {
        if (active) {
          setItems([]);
          setCartItems([]);
          setLoadedUserId(userId);
          toast.error(error.message);
        }
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
  }, [isPending, userId, kind, isCart]);

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

  function isUnavailable(item) {
    return (item.variants ?? []).every((variant) => variant.stock < 1)
      || (item.selectedVariant?.stock ?? 1) < 1;
  }

  function wishlistActionLabel(item) {
    const variants = item.variants ?? [];
    const selectedSku = getSelectedSku(item);
    if (isUnavailable(item)) return "Out of stock";
    if (variants.find((variant) => variant.sku === selectedSku)?.stock < 1) return "Unavailable";
    if (busyProduct.startsWith(`${item.id}:`)) return "Adding…";
    if (isItemInCart(item)) return "View in cart";
    if (variants.length > 1 && !selectedSku) return "Choose a size";
    return "Add to cart";
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

  async function placeOrder(event) {
    event.preventDefault();
    if (placingOrder || !items.length) return;
    if (!session?.user) {
      toast.info("Please log in to place an order.");
      router.push("/login");
      return;
    }

    const validationErrors = validateCheckoutAddress(checkoutAddress);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      focusFirstCheckoutError(validationErrors);
      toast.error("Check the highlighted delivery details.");
      return;
    }

    setPlacingOrder(true);
    if (!idempotencyKey.current) idempotencyKey.current = window.crypto.randomUUID();
    try {
      const { order } = await createOrder({
        idempotencyKey: idempotencyKey.current,
        address: checkoutAddress,
      });
      router.push(`/orders/${order.id}`);
    } catch (error) {
      const errors = error.fieldErrors || {};
      setFieldErrors(errors);
      focusFirstCheckoutError(errors);
      toast.error(error.message);
    } finally {
      setPlacingOrder(false);
    }
  }

  function updateAddress(field, value) {
    setAddressUserId(userId);
    setAddress((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  return (
    <main className="account-collection wrap">
      <div className="account-collection-heading">
        <span className="eyebrow">Your Leebazz account</span>
        <h1><Icon size={27} strokeWidth={1.4} aria-hidden="true" />{title}</h1>
        <p>{isCart ? "Your selected pieces are gathered here." : "Keep the pieces you love close at hand."}</p>
      </div>

      {isPending || (Boolean(session?.user) && (loading || loadedUserId !== userId)) ? (
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
        <div className={`account-collection-content${isCart ? " has-checkout" : ""}`}>
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
                  <div className="detail-product-status">
                    {item.isNewArrival && <span className="product-arrival-badge">New arrival</span>}
                    {(item.selectedVariant?.stock < 1 || item.variants?.every((variant) => variant.stock < 1)) && <span className="product-stock-badge">Out of stock</span>}
                  </div>
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
                        {item.variants.map((variant) => <option key={variant.sku} value={variant.sku} disabled={variant.stock < 1}>{variant.label}{variant.stock < 1 ? " · Unavailable" : ""}</option>)}
                      </select>
                    </label>
                  )}
                  {isCart && (
                    <div className="cart-quantity" role="group" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" aria-label={`Decrease quantity of ${item.name}`} disabled={busyProduct === (item.cartItemId || item.id) || item.quantity <= 1} onClick={() => changeQuantity(item, item.quantity - 1)}><Minus size={13} aria-hidden="true" /></button>
                      <output aria-live="polite" aria-atomic="true">{item.quantity}</output>
                      <button type="button" aria-label={`Increase quantity of ${item.name}`} disabled={busyProduct === (item.cartItemId || item.id) || item.quantity >= 99} onClick={() => changeQuantity(item, item.quantity + 1)}><Plus size={13} aria-hidden="true" /></button>
                    </div>
                  )}
                </div>
                <div className="account-product-end">
                  {isCart && <strong>{formatPrice(item.price * item.quantity, item.currency)}</strong>}
                  {!isCart && (
                    <button
                      className="wishlist-add-to-cart"
                      type="button"
                      aria-label={`${wishlistActionLabel(item)}: ${item.name}`}
                      disabled={Boolean(busyProduct) || isUnavailable(item) || item.variants?.find((variant) => variant.sku === getSelectedSku(item))?.stock < 1 || ((item.variants?.length ?? 0) > 1 && !selectedVariants[item.id])}
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingBag size={14} aria-hidden="true" />
                      {wishlistActionLabel(item)}
                    </button>
                  )}
                  <button className="account-remove" type="button" aria-label={`Remove ${item.name} from ${isCart ? "cart" : "wishlist"}`} disabled={busyProduct === (item.cartItemId || item.id)} onClick={() => removeItem(item)}>
                    <Trash2 size={15} aria-hidden="true" />Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
          {isCart && (
            <form className="cart-summary cart-checkout-panel" noValidate onSubmit={placeOrder}>
              <h2 className="cart-checkout-heading">Order Summary</h2>
              <div className="cart-checkout-total"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
              <div className="cart-checkout-total"><span>Delivery fee</span><strong>{formatPrice(deliveryFee)}</strong></div>
              <div className="cart-checkout-total cart-checkout-grand-total"><span>Estimated total</span><strong>{formatPrice(total + deliveryFee)}</strong></div>
              {session?.user && (
                <div className="cart-checkout-fields">
                  <h2>Delivery Information</h2>
                  {Object.keys(fieldErrors).some((field) => checkoutFieldIds[field]) && (
                    <div className="checkout-error-summary" role="alert" aria-labelledby="checkout-error-heading">
                      <h3 id="checkout-error-heading">Check your delivery information</h3>
                      <ul>
                        {Object.entries(fieldErrors).filter(([field]) => checkoutFieldIds[field]).map(([field, message]) => (
                          <li key={field}><a href={`#${checkoutFieldIds[field]}`}>{checkoutFieldLabels[field]}: {message}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <label>Full name
                    <input id="checkout-name" required autoComplete="name" maxLength={100} value={checkoutAddress.name} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "checkout-name-error" : undefined} onChange={(event) => updateAddress("name", event.target.value)} />
                    {fieldErrors.name && <span className="checkout-field-error" id="checkout-name-error">{fieldErrors.name}</span>}
                  </label>
                  <label>Bangladesh mobile number
                    <input id="checkout-phone" required type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder="01XXXXXXXXX" value={checkoutAddress.phone} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "checkout-phone-error" : undefined} onChange={(event) => updateAddress("phone", event.target.value)} />
                    {fieldErrors.phone && <span className="checkout-field-error" id="checkout-phone-error">{fieldErrors.phone}</span>}
                  </label>
                  <label>House/road and area
                    <input id="checkout-address" required autoComplete="street-address" maxLength={250} placeholder="House, road, neighbourhood" value={checkoutAddress.addressLine} aria-invalid={Boolean(fieldErrors.addressLine)} aria-describedby={fieldErrors.addressLine ? "checkout-address-error" : undefined} onChange={(event) => updateAddress("addressLine", event.target.value)} />
                    {fieldErrors.addressLine && <span className="checkout-field-error" id="checkout-address-error">{fieldErrors.addressLine}</span>}
                  </label>
                  <div className="cart-checkout-address-row">
                    <label>City / area
                      <input id="checkout-city" required autoComplete="address-level2" maxLength={100} value={checkoutAddress.city} aria-invalid={Boolean(fieldErrors.city)} aria-describedby={fieldErrors.city ? "checkout-city-error" : undefined} onChange={(event) => updateAddress("city", event.target.value)} />
                      {fieldErrors.city && <span className="checkout-field-error" id="checkout-city-error">{fieldErrors.city}</span>}
                    </label>
                    <label>Postal code (optional)
                      <input id="checkout-postal-code" autoComplete="postal-code" maxLength={20} value={checkoutAddress.postalCode} aria-invalid={Boolean(fieldErrors.postalCode)} aria-describedby={fieldErrors.postalCode ? "checkout-postal-code-error" : undefined} onChange={(event) => updateAddress("postalCode", event.target.value)} />
                      {fieldErrors.postalCode && <span className="checkout-field-error" id="checkout-postal-code-error">{fieldErrors.postalCode}</span>}
                    </label>
                  </div>
                </div>
              )}
              {session?.user ? (
                <button className="button button-dark cart-place-order" type="submit" disabled={placingOrder || Boolean(busyProduct)}>
                  {placingOrder ? "Placing order…" : "Place order"}
                </button>
              ) : (
                <Link className="button button-dark" href="/login">Log in to place your order</Link>
              )}
            </form>
          )}
        </div>
      )}
    </main>
  );
}
