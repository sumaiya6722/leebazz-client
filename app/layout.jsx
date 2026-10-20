import "./globals.css";
import { getCatalog, getProducts } from "@/lib/catalog";
import { socialLinks } from "@/lib/site-config";
import { Header, Footer } from "@/components/storefront";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "Leebazz — Considered finds for everyday living",
  description:
    "Explore clothing, jewellery, home accents and everyday care at Leebazz.",
};

export default async function RootLayout({ children }) {
  const [catalog, products] = await Promise.all([getCatalog(), getProducts()]);
  return (
    <html lang="en">
      <body>
        <Header categories={catalog.categories} />
        <ToastContainer></ToastContainer>
        {children}
        <Footer
          categories={catalog.categories}
          products={products}
          socialLinks={socialLinks}
        />
      </body>
    </html>
  );
}
