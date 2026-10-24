import Link from "next/link";
import { ArrowUpRight, Construction } from "lucide-react";

export function AdminPlaceholder({ title, description, eyebrow = "COMING NEXT" }) {
  return (
    <main className="admin-page">
      <header className="admin-page-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <section className="admin-empty-panel" aria-label={`${title} setup status`}>
        <span className="admin-empty-icon"><Construction size={22} strokeWidth={1.6} aria-hidden="true" /></span>
        <h2>This section is not connected yet</h2>
        <p>Admin tools and live records will appear here as this part of the dashboard is built.</p>
        <Link href="/admin" className="admin-inline-link">Back to dashboard <ArrowUpRight size={15} /></Link>
      </section>
    </main>
  );
}
