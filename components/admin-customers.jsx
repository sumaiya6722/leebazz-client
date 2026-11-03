"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ban, CheckCircle2, ChevronDown, Mail, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { getAdminCustomers } from "@/lib/customers-api";
import { formatPrice } from "@/lib/catalog";

function formatCustomerDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en-BD", {
        dateStyle: "medium",
        timeZone: "Asia/Dhaka",
      }).format(date);
}

function CustomerOrder({ order }) {
  const products = order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ");
  return (
    <article className="admin-customer-order">
      <div>
        <Link className="order-number" href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
        <p>{products}</p>
        <span>{formatCustomerDate(order.createdAt)} · Payment: {order.paymentStatus}</span>
      </div>
      <div>
        <strong>{formatPrice(order.total)}</strong>
        <span className="order-status-badge">{(order.status || "pending_confirmation").replaceAll("_", " ")}</span>
      </div>
    </article>
  );
}

export function AdminCustomers() {
  const { data: session } = authClient.useSession();
  const adminUserId = session?.user?.id;
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [busyCustomerId, setBusyCustomerId] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    getAdminCustomers(1)
      .then((result) => {
        if (!active) return;
        setCustomers(result.customers);
        setTotal(result.total);
        setHasMore(result.hasMore);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getAdminCustomers(nextPage);
      setCustomers((current) => [...current, ...result.customers]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setLoadingMore(false);
    }
  }

  async function setCustomerBanned(customer, banned) {
    if (busyCustomerId) return;
    if (banned && customer.id === adminUserId) {
      toast.error("You cannot block your own administrator account.");
      return;
    }
    setBusyCustomerId(customer.id);
    try {
      let result;
      if (banned) {
        result = await authClient.admin.banUser({ userId: customer.id, banReason: "Blocked by a store administrator." });
      } else {
        result = await authClient.admin.unbanUser({ userId: customer.id });
      }
      if (result.error) throw new Error(result.error.message || "Could not update this customer.");
      setCustomers((current) => current.map((item) => item.id === customer.id
        ? { ...item, banned, banReason: banned ? "Blocked by a store administrator." : "" }
        : item));
      toast.success(banned ? "Customer blocked and their active sessions revoked." : "Customer unblocked.");
    } catch (requestError) {
      toast.error(requestError.message || "Could not update this customer.");
    } finally {
      setBusyCustomerId("");
    }
  }

  async function removeCustomer(customer) {
    if (busyCustomerId) return;
    if (customer.id === adminUserId || customer.role === "admin") {
      toast.error("Administrator accounts cannot be removed from this page.");
      return;
    }
    const confirmed = window.confirm(
      `Remove ${customer.name || customer.email}'s account? They will no longer be able to sign in. Their order history will remain in the store's order records.`,
    );
    if (!confirmed) return;
    setBusyCustomerId(customer.id);
    try {
      const result = await authClient.admin.removeUser({ userId: customer.id });
      if (result.error) throw new Error(result.error.message || "Could not remove this customer.");
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
      setTotal((current) => Math.max(0, current - 1));
      toast.success("Customer account removed. Order records were preserved.");
    } catch (requestError) {
      toast.error(requestError.message || "Could not remove this customer.");
    } finally {
      setBusyCustomerId("");
    }
  }

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email}`.toLocaleLowerCase().includes(normalizedQuery),
  );

  return (
    <main className="admin-page admin-customers-page">
      <header className="admin-page-heading">
        <div>
          <span className="eyebrow">CUSTOMER ACCOUNTS</span>
          <h1>Customers</h1>
          <p>Signed-up customers, account status, and order history.</p>
        </div>
        <span className="admin-demo-badge">{total} CUSTOMERS</span>
      </header>

      <label className="admin-customer-search">
        <UserRound size={17} aria-hidden="true" />
        <span className="sr-only">Search customers</span>
        <input
          type="search"
          placeholder="Search by customer name or email"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </label>

      {loading ? (
        <p className="admin-customers-state" role="status">Loading customers…</p>
      ) : error ? (
        <p className="admin-customers-state is-error" role="alert">{error}</p>
      ) : customers.length === 0 ? (
        <p className="admin-customers-state">No signed-up customers yet.</p>
      ) : visibleCustomers.length === 0 ? (
        <p className="admin-customers-state">No customers match “{query}”.</p>
      ) : (
        <div className="admin-customer-list">
          {visibleCustomers.map((customer) => {
            const busy = busyCustomerId === customer.id;
            return (
              <article className={`admin-customer-card${customer.banned ? " is-blocked" : ""}`} key={customer.id}>
                <header className="admin-customer-heading">
                  <div className="admin-customer-avatar" aria-hidden="true">
                    <UserRound size={20} />
                  </div>
                  <div className="admin-customer-identity">
                    <h2>{customer.name || "Unnamed customer"}</h2>
                    <a href={`mailto:${customer.email}`}><Mail size={14} />{customer.email}</a>
                  </div>
                  <span className={`admin-customer-status${customer.banned ? " is-blocked" : ""}`}>
                    {customer.banned ? <><Ban size={13} />Blocked</> : <><CheckCircle2 size={13} />Active</>}
                  </span>
                </header>

                <dl className="admin-customer-details">
                  <div><dt>Joined</dt><dd>{formatCustomerDate(customer.createdAt)}</dd></div>
                  <div><dt>Email</dt><dd>{customer.emailVerified ? "Verified" : "Not verified"}</dd></div>
                  <div><dt>Orders</dt><dd>{customer.orderCount}</dd></div>
                  <div><dt>Total spent</dt><dd>{formatPrice(customer.totalSpent)}</dd></div>
                </dl>

                {customer.banned && customer.banReason && (
                  <p className="admin-customer-ban-reason"><ShieldCheck size={14} />Reason: {customer.banReason}</p>
                )}

                <details className="admin-customer-history">
                  <summary><span>Order history ({customer.orderCount})</span><ChevronDown size={16} aria-hidden="true" /></summary>
                  {customer.orders.length ? (
                    <div className="admin-customer-orders">
                      {customer.orders.map((order) => <CustomerOrder order={order} key={order.id} />)}
                    </div>
                  ) : (
                    <p className="admin-customer-no-orders">This customer has not placed any orders.</p>
                  )}
                </details>

                <footer className="admin-customer-actions">
                  <button
                    type="button"
                    className={customer.banned ? "admin-customer-unblock" : "admin-customer-block"}
                    disabled={Boolean(busyCustomerId)}
                    onClick={() => setCustomerBanned(customer, !customer.banned)}
                  >
                    {customer.banned ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                    {busy ? "Updating…" : customer.banned ? "Unblock customer" : "Block customer"}
                  </button>
                  <button
                    type="button"
                    className="admin-customer-remove"
                    disabled={Boolean(busyCustomerId) || customer.role === "admin"}
                    onClick={() => removeCustomer(customer)}
                  >
                    <Trash2 size={14} />
                    {busy ? "Updating…" : "Remove account"}
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      )}
      {!loading && !error && hasMore && (
        <div className="admin-customer-more">
          <button type="button" className="button button-dark" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more customers"}
          </button>
        </div>
      )}
    </main>
  );
}
