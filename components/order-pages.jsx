"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/catalog";
import {
  getAdminOrders,
  getMyOrders,
  getOrder,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/lib/orders-api";

const orderStatuses = [
  "pending_confirmation",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const orderStatusActions = {
  pending_confirmation: { status: "confirmed", label: "Confirm order", successMessage: "Order confirmed." },
  confirmed: { status: "processing", label: "Start processing", successMessage: "Order processing started." },
  processing: { status: "shipped", label: "Mark as shipped", successMessage: "Order marked as shipped." },
  shipped: { status: "delivered", label: "Mark as delivered", successMessage: "Order marked as delivered." },
};

const cancellableOrderStatuses = ["pending_confirmation", "confirmed", "processing"];

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en-BD", {
        dateStyle: "long",
        timeZone: "Asia/Dhaka",
      }).format(date);
}

function formatStatus(status) {
  return (status || "pending_confirmation").replaceAll("_", " ");
}

function OrderCard({ order, admin = false }) {
  const href = admin ? `/admin/orders/${order.id}` : `/orders/${order.id}`;
  const productNames = order.items.map(
    (item) => `${item.productName} × ${item.quantity}`,
  ).join(", ");

  return (
    <article className="order-card">
      <div>
        <Link className="order-number" href={href}>{order.orderNumber}</Link>
        <div className="order-meta">
          <span>{formatDate(order.createdAt)}</span>
          <span>{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</span>
          <span>Payment: {order.paymentStatus}</span>
          <span>Estimated delivery date: {formatDate(order.estimatedDeliveryDate)}</span>
          {admin && <span>{order.customer.name} · {order.customer.email}</span>}
        </div>
        <p className="order-products">{productNames}</p>
        {admin && <p className="order-products">{order.customer.phone} · {order.address.city}</p>}
      </div>
      <div className="order-card-end">
        <strong className="order-total">{formatPrice(order.total)}</strong>
        <span className="order-status-badge">{formatStatus(order.status)}</span>
        <Link className="order-detail-link" href={href}>View details</Link>
      </div>
    </article>
  );
}

export function CustomerOrdersPage() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [orders, setOrders] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending || !userId) return;
    let active = true;
    getMyOrders()
      .then((result) => {
        if (active) {
          setOrders(result.orders);
          setLoadedUserId(userId);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setOrders([]);
          setLoadedUserId(userId);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isPending, userId]);

  return (
    <main className="wrap order-page">
      <header className="order-page-heading">
        <div>
          <span className="eyebrow">YOUR LEEBAZZ ACCOUNT</span>
          <h1>My orders</h1>
          <p>Review your purchases and the latest fulfilment status.</p>
        </div>
        <Link className="button button-dark" href="/shop">Continue shopping</Link>
      </header>
      {!session?.user && !isPending ? <div className="order-message">Please <Link className="order-detail-link" href="/login">log in</Link> to view your orders.</div>
        : isPending || loading || loadedUserId !== userId ? <p className="order-message" role="status">Loading your orders…</p>
          : error ? <p className="order-message order-error" role="alert">{error}</p>
            : orders.length ? <div className="order-list">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
              : <div className="order-message">You haven’t placed an order yet. <Link className="order-detail-link" href="/shop">Explore the collection</Link></div>}
    </main>
  );
}

export function OrderDetailPage({ id, admin = false }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [order, setOrder] = useState(null);
  const [loadedOrderId, setLoadedOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    if (isPending || !userId) return;
    let active = true;
    getOrder(id)
      .then((result) => {
        if (!active) return;
        setOrder(result.order);
        setLoadedOrderId(id);
        setError("");
      })
      .catch((requestError) => {
        if (active) {
          setOrder(null);
          setLoadedOrderId(id);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id, isPending, userId]);

  async function saveStatus(status, successMessage = "Order status updated.") {
    if (savingStatus) return;
    setSavingStatus(true);
    try {
      const result = await updateOrderStatus(id, status);
      setOrder(result.order);
      toast.success(successMessage);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSavingStatus(false);
    }
  }

  function advanceOrderStatus() {
    const nextAction = orderStatusActions[order?.status];
    if (nextAction) {
      saveStatus(nextAction.status, nextAction.successMessage);
    }
  }

  function cancelOrder() {
    if (!cancellableOrderStatuses.includes(order?.status)) return;
    if (window.confirm("Cancel this order? This action cannot be undone.")) {
      saveStatus("cancelled", "Order cancelled.");
    }
  }

  async function markPaymentAsPaid() {
    setSavingPayment(true);
    try {
      const result = await updateOrderPaymentStatus(id, "paid");
      setOrder(result.order);
      toast.success("COD payment marked as collected.");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSavingPayment(false);
    }
  }

  return (
    <main className="wrap order-page">
      <header className="order-page-heading">
        <div>
          <span className="eyebrow">{admin ? "ORDER MANAGEMENT" : "ORDER CONFIRMATION"}</span>
          <h1>{order ? (admin ? order.orderNumber : "Thank you for your order") : "Order details"}</h1>
          {order && <p>{admin ? `Placed ${formatDate(order.createdAt)}` : `Order ${order.orderNumber} was placed on ${formatDate(order.createdAt)}.`}</p>}
        </div>
        <div className="order-heading-actions">
          {admin
            ? <Link className="button button-dark" href="/admin/orders">All orders</Link>
            : <><Link className="button button-dark" href="/profile/orders">My orders</Link><Link className="button button-dark" href="/shop">Continue shopping</Link></>}
        </div>
      </header>
      {!session?.user && !isPending ? <p className="order-message">Please <Link className="order-detail-link" href="/login">log in</Link> to view this order.</p>
        : isPending || loading || loadedOrderId !== id ? <p className="order-message" role="status">Loading order…</p>
          : error ? <p className="order-message order-error" role="alert">{error}</p>
            : order && (
              <div className="order-detail">
                <section className="order-detail-card">
                  <h2>Order summary</h2>
                  <div className="order-detail-items">
                    {order.items.map((item) => (
                      <article className="order-detail-item" key={`${item.productId}:${item.variant.sku}`}>
                        <div className="order-detail-image">
                          {item.image && <Image src={item.image} alt={item.productName} fill sizes="74px" />}
                        </div>
                        <div>
                          <h3>{item.productName}</h3>
                          <p>{item.variant.label} · {item.variant.sku}</p>
                          {Object.entries(item.attributes || {})
                            .filter(([key]) => ["colour", "color", "fabric", "material"].includes(key.toLowerCase()))
                            .map(([key, value]) => <p key={key}>{key}: {Array.isArray(value) ? value.join(", ") : value}</p>)}
                          <p>Quantity: {item.quantity} · {formatPrice(item.unitPrice)} each</p>
                        </div>
                        <strong>{formatPrice(item.subtotal)}</strong>
                      </article>
                    ))}
                  </div>
                  <div className="order-totals">
                    <div><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                    <div><span>Delivery fee</span><span>{formatPrice(order.deliveryFee)}</span></div>
                    <div className="order-grand-total"><span>Order total</span><span>{formatPrice(order.total)}</span></div>
                  </div>
                </section>
                <aside className="order-detail-card">
                  <h2>{admin ? "Customer & delivery" : "Delivery & payment"}</h2>
                  <dl className="order-info-list">
                    <div><dt>Recipient</dt><dd>{order.address.name}</dd></div>
                    <div><dt>Contact</dt><dd>{order.customer.phone}<br />{order.customer.email}</dd></div>
                    <div><dt>Delivery address</dt><dd>{order.address.addressLine}<br />{order.address.city}{order.address.postalCode ? `, ${order.address.postalCode}` : ""}</dd></div>
                    <div><dt>Estimated delivery date</dt><dd>{formatDate(order.estimatedDeliveryDate)}</dd></div>
                    <div><dt>Payment method</dt><dd>Cash on Delivery</dd></div>
                    <div><dt>Payment status</dt><dd>{order.paymentStatus}</dd></div>
                    <div><dt>Order status</dt><dd><span className="order-status-badge">{formatStatus(order.status)}</span></dd></div>
                  </dl>
                  {admin && (
                    <section className="order-status-control" aria-label="Fulfilment status actions">
                      <strong>Fulfilment status</strong>
                      {orderStatusActions[order.status] ? (
                        <button className="button button-dark" type="button" disabled={savingStatus} onClick={advanceOrderStatus}>
                          {savingStatus ? "Saving…" : orderStatusActions[order.status].label}
                        </button>
                      ) : (
                        <p className="order-status-complete">
                          {order.status === "delivered" ? "Order delivered" : "Order cancelled"}
                        </p>
                      )}
                      {cancellableOrderStatuses.includes(order.status) && (
                        <button className="order-cancel-button" type="button" disabled={savingStatus} onClick={cancelOrder}>
                          Cancel order
                        </button>
                      )}
                      <small>Changing fulfilment status does not change payment status.</small>
                    </section>
                  )}
                  {admin && order.paymentMethod === "COD" && (
                    <div className="order-status-control">
                      <strong>Cash on Delivery payment</strong>
                      <p>{order.paymentStatus === "paid" ? "Payment collected" : "Only mark as paid after cash collection is verified."}</p>
                      {order.paymentStatus === "pending" && (
                        <button
                          className="button button-dark"
                          type="button"
                          disabled={savingPayment}
                          onClick={markPaymentAsPaid}
                        >
                          {savingPayment ? "Saving…" : "Mark COD as paid"}
                        </button>
                      )}
                    </div>
                  )}
                </aside>
              </div>
            )}
    </main>
  );
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState({ q: "", status: "", paymentStatus: "", from: "", to: "" });

  async function loadOrders(nextFilters = {}) {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminOrders(nextFilters);
      setOrders(result.orders);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getAdminOrders()
      .then((result) => {
        if (active) setOrders(result.orders);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function submitFilters(event) {
    event.preventDefault();
    loadOrders(search);
  }

  return (
    <main className="wrap order-page">
      <header className="order-page-heading">
        <div><span className="eyebrow">ADMINISTRATION</span><h1>Orders</h1><p>Review customer orders and manage fulfilment status.</p></div>
      </header>
      <form className="order-filters" onSubmit={submitFilters}>
        <label>Order or customer<input value={search.q} onChange={(event) => setSearch({ ...search, q: event.target.value })} placeholder="Order number, name, email, phone" /></label>
        <label>Status<select value={search.status} onChange={(event) => setSearch({ ...search, status: event.target.value })}><option value="">All statuses</option>{orderStatuses.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}</select></label>
        <label>Payment<select value={search.paymentStatus} onChange={(event) => setSearch({ ...search, paymentStatus: event.target.value })}><option value="">All payments</option><option value="pending">Pending</option><option value="paid">Paid</option></select></label>
        <label>From<input type="date" value={search.from} onChange={(event) => setSearch({ ...search, from: event.target.value })} /></label>
        <label>To<input type="date" value={search.to} onChange={(event) => setSearch({ ...search, to: event.target.value })} /></label>
        <button className="button button-dark" type="submit">Search</button>
      </form>
      {loading ? <p className="order-message" role="status">Loading orders…</p>
        : error ? <p className="order-message order-error" role="alert">{error}</p>
          : orders.length ? <div className="order-list">{orders.map((order) => <OrderCard key={order.id} order={order} admin />)}</div>
            : <p className="order-message">No orders match these filters.</p>}
    </main>
  );
}
