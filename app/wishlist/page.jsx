import { connection } from "next/server";
import { AccountCollection } from "@/components/account-collection";

export const instant = false;

export const metadata = {
  title: "Your Wishlist | Leebazz",
  description: "Revisit the Leebazz pieces you have saved to your wishlist.",
};

export default async function WishlistPage() {
  await connection();
  return <AccountCollection kind="wishlist" />;
}
