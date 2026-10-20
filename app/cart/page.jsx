import { AccountCollection } from "@/components/account-collection";

export const metadata = {
  title: "Your Cart | Leebazz",
  description: "Review the pieces you have added to your Leebazz cart.",
};

export default function CartPage() {
  return <AccountCollection kind="cart" />;
}
