import { CustomerOrdersPage } from "@/components/order-pages";

export const instant = false;
export const metadata = {
  title: "Track Your Orders | Leebazz",
  description: "View your Leebazz orders and their latest payment and delivery status.",
};

export default function TrackYourOrdersPage() {
  return <CustomerOrdersPage tracking />;
}
