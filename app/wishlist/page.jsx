import { AccountCollection } from "@/components/account-collection";

export const metadata = {
  title: "Your Wishlist | Leebazz",
  description: "Revisit the Leebazz pieces you have saved to your wishlist.",
};

export default function WishlistPage() {
  return <AccountCollection kind="wishlist" />;
}
