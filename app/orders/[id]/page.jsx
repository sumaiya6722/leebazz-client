import { OrderDetailPage } from "@/components/order-pages";

export const metadata = {
  title: "Order details | Leebazz",
};

export const instant = false;

export default async function Page({ params }) {
  const { id } = await params;
  return <OrderDetailPage id={id} />;
}
