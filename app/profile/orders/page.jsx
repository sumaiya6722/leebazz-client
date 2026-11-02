import { CustomerOrdersPage } from "@/components/order-pages";

export const instant = false;
export const metadata = {
  title: "My Orders | Leebazz",
  description: "View your Leebazz order history and delivery status.",
};

export default function Page() {
  return <CustomerOrdersPage />;
}
