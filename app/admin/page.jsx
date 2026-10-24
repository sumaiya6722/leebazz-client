import Link from "next/link";
import { ArrowUpRight, CircleHelp, Package, ShoppingBag, UsersRound, Wallet } from "lucide-react";

export const instant = false;

const summaryCards = [
  {
    label: "Products",
    value: "—",
    note: "Store catalog exists; admin summary API is not connected.",
    icon: Package,
  },
  {
    label: "Orders",
    value: "—",
    note: "No order records or order API are configured yet.",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    value: "—",
    note: "Accounts use Better Auth; dashboard reporting is not connected.",
    icon: UsersRound,
  },
  {
    label: "Revenue",
    value: "—",
    note: "No order or payment data source is available yet.",
    icon: Wallet,
  },
];

export const metadata = {
  title: "Admin Dashboard | Leebazz",
  description: "Leebazz administration dashboard overview.",
};

export default function AdminDashboardPage() {
  return (
    <main className="admin-page">
      <header className="admin-page-heading admin-overview-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Welcome to your Leebazz administration workspace.</p>
        </div>
        <span className="admin-demo-badge">FOUNDATION · DATA NOT CONNECTED</span>
      </header>

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

      <section className="admin-dashboard-empty" aria-labelledby="admin-activity-title">
        <div className="admin-dashboard-empty-icon"><CircleHelp size={20} strokeWidth={1.6} aria-hidden="true" /></div>
        <div>
          <span className="eyebrow">ACTIVITY</span>
          <h2 id="admin-activity-title">No dashboard activity to show yet</h2>
          <p>
            Live product, order, customer, and revenue summaries need admin data APIs.
            The current project has no order or payment data source.
          </p>
        </div>
      </section>

      <footer className="admin-page-footer">
        <span>Next up: connect secure admin data sources.</span>
        <Link href="/admin/products">Open Products <ArrowUpRight size={15} /></Link>
      </footer>
    </main>
  );
}
