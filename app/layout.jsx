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

export const instant = false;

export default async function RootLayout({ children }) {
  const [catalog, products] = await Promise.all([getCatalog(), getProducts()]);
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Header categories={catalog.categories} />
        <ToastContainer></ToastContainer>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <Footer
          categories={catalog.categories}
          products={products}
          socialLinks={socialLinks}
        />
      </body>
    </html>
  );
}
