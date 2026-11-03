import { AdminFaqQueries } from "@/components/admin-faq-queries";
import { connection } from "next/server";

export const instant = false;
export const metadata = { title: "Customer Questions | Leebazz Admin" };

export default async function AdminFaqQueriesPage() {
  await connection();
  return <AdminFaqQueries />;
}
