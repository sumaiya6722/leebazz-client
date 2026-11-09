import { OrderDetailPage } from "@/components/order-pages";

export const metadata = {
  title: "Order details | Leebazz Admin",
};

export const instant = false;

export default async function AdminOrderPage({ params }) {
  const { id } = await params;
  return <OrderDetailPage id={id} admin />;
}
