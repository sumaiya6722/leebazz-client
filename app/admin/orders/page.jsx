import { AdminOrdersPage as OrdersDashboard } from "@/components/order-pages";

export const instant = false;
export const metadata = { title: "Orders | Leebazz Admin" };

export default function AdminOrdersRoute() {
  return <OrdersDashboard />;
}
