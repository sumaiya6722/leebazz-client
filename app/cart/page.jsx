import { connection } from "next/server";
import { AccountCollection } from "@/components/account-collection";

export const instant = false;

export const metadata = {
  title: "Your Cart | Leebazz",
  description: "Review the pieces you have added to your Leebazz cart.",
};

export default async function CartPage() {
  await connection();
  return <AccountCollection kind="cart" />;
}
