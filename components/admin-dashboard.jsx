"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ArrowUpRight,
  CircleAlert,
  Package,
  ShoppingBag,
  UsersRound,
  Wallet,
} from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import { getAdminDashboard } from "@/lib/admin-dashboard-api";

const numberFormatter = new Intl.NumberFormat("en-BD");
const dateFormatter = new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium",
  timeZone: "Asia/Dhaka",
});
const ratioColors = ["#75815c", "#a45336", "#657b94"];

function formatStatus(status) {
  return (status || "pending_confirmation").replaceAll("_", " ");
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function DashboardChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="dashboard-chart-tooltip">
      <strong>{point.name}</strong>
      <span>{numberFormatter.format(point.value)} ({point.percentage}%)</span>
    </div>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const result = await getAdminDashboard();
      setData(result);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const result = await getAdminDashboard();
        if (active) {
          setData(result);
          setError("");
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const ratioTotal = data
    ? data.customers + data.products + data.orders
    : 0;
  const chartData = data ? [
    { name: "Customers", value: data.customers },
    { name: "Products", value: data.products },
    { name: "Orders", value: data.orders },
  ].map((item) => ({
    ...item,
    percentage: ratioTotal ? Number(((item.value / ratioTotal) * 100).toFixed(1)) : 0,
  })) : [];
  const summaryCards = data ? [
    {
      label: "Customers",
      value: numberFormatter.format(data.customers),
      note: "Registered customer accounts",
      icon: UsersRound,
    },
    {
      label: "Products",
      value: numberFormatter.format(data.products),
      note: data.outOfStockProducts
        ? `${numberFormatter.format(data.outOfStockProducts)} currently out of stock`
        : "Active products in your catalogue",
      icon: Package,
    },
    {
      label: "Orders",
      value: numberFormatter.format(data.orders),
      note: `${numberFormatter.format(data.pendingOrders)} awaiting confirmation`,
      icon: ShoppingBag,
    },
    {
      label: "Revenue",
      value: formatPrice(data.revenue),
      note: `Collected from ${numberFormatter.format(data.paidOrders)} paid orders`,
      icon: Wallet,
    },
  ] : [];

  return (
    <main className="admin-page">
      <header className="admin-page-heading admin-overview-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Live performance and activity across your Leebazz store.</p>
        </div>
        <span className="admin-dashboard-updated">Updates automatically every minute</span>
      </header>

      {error && (
        <section className="admin-dashboard-error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <div><strong>Dashboard data is unavailable</strong><p>{error}</p></div>
          <button type="button" className="admin-retry-button" onClick={loadDashboard}>Try again</button>
        </section>
      )}

      {loading && !data ? (
        <p className="admin-dashboard-loading" role="status">Loading store performance…</p>
      ) : data ? (
        <>
          <section className="admin-summary-grid" aria-label="Store summary">
            {summaryCards.map(({ label, value, note, icon: Icon }) => (
              <article className="admin-summary-card" key={label}>
                <div className="admin-summary-card-top">
                  <span>{label}</span>
                  <Icon size={18} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <strong>{value}</strong>
                <p>{note}</p>
              </article>
            ))}
          </section>

          <section className="admin-dashboard-chart-panel" aria-labelledby="dashboard-chart-title">
            <header className="admin-dashboard-section-heading">
              <div>
                <span className="eyebrow">STORE SNAPSHOT</span>
                <h2 id="dashboard-chart-title">Customer, product &amp; order ratio</h2>
                <p>Compare the share of each group across your store.</p>
              </div>
            </header>
            <div className="admin-dashboard-chart-content">
              <div className="admin-dashboard-chart">
                {ratioTotal ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="58%"
                        outerRadius="84%"
                        paddingAngle={3}
                        stroke="#fff"
                        strokeWidth={3}
                      >
                        {chartData.map((item, index) => (
                          <Cell key={item.name} fill={ratioColors[index]} />
                        ))}
                      </Pie>
                      <Tooltip content={<DashboardChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="admin-dashboard-chart-empty">There is not enough store data to calculate a ratio yet.</p>
                )}
              </div>
              <div className="admin-dashboard-chart-legend" aria-label="Store counts and ratio">
                {chartData.map((item, index) => (
                  <div className="admin-dashboard-chart-legend-item" key={item.name}>
                    <span className="admin-dashboard-chart-swatch" style={{ backgroundColor: ratioColors[index] }} />
                    <span className="admin-dashboard-chart-label">{item.name}</span>
                    <strong>{numberFormatter.format(item.value)}</strong>
                    <small>{item.percentage}%</small>
                  </div>
                ))}
                <div className="admin-dashboard-chart-total">
                  <span>Total records</span>
                  <strong>{numberFormatter.format(ratioTotal)}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-dashboard-recent" aria-labelledby="dashboard-recent-title">
            <header className="admin-dashboard-section-heading">
              <div>
                <span className="eyebrow">LATEST ACTIVITY</span>
                <h2 id="dashboard-recent-title">Recent orders</h2>
              </div>
              <Link className="admin-inline-link" href="/admin/orders">View all orders <ArrowUpRight size={14} /></Link>
            </header>
            {data.recentOrders.length ? (
              <div className="admin-dashboard-table-wrap">
                <table className="admin-dashboard-table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Status</th><th>Total</th></tr></thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td><Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link></td>
                        <td>{order.customerName}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td><span className={`admin-dashboard-payment is-${order.paymentStatus}`}>{order.paymentStatus}</span></td>
                        <td><span className="order-status-badge">{formatStatus(order.status)}</span></td>
                        <td>{formatPrice(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-dashboard-recent-empty">No orders have been placed yet.</p>
            )}
          </section>
        </>
      ) : !error ? (
        <p className="admin-dashboard-loading">No dashboard data is available yet.</p>
      ) : null}

      <footer className="admin-page-footer">
        <span>Manage the catalogue and fulfilment from your admin workspace.</span>
        <Link href="/admin/products">Open Products <ArrowUpRight size={15} /></Link>
      </footer>
    </main>
  );
}
