"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  UsersRound,
} from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: UsersRound },
  { href: "/admin/faq-queries", label: "Customer questions", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" href="/" aria-label="Leebazz storefront">
        leebazz<span>.</span>
      </Link>
      <p className="admin-sidebar-label">ADMINISTRATION</p>
      <nav className="admin-nav" aria-label="Admin navigation">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              className={`admin-nav-link${active ? " is-active" : ""}`}
              href={href}
              key={href}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
