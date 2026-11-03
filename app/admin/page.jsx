import { AdminDashboard } from "@/components/admin-dashboard";

export const instant = false;

export const metadata = {
  title: "Admin Dashboard | Leebazz",
  description: "Live Leebazz store performance and activity.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
