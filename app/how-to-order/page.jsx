import Link from "next/link";
import { ArrowUpRight, CircleCheck, ClipboardList, CreditCard, PackageCheck, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "How To Order | Leebazz",
  description: "Follow these simple steps to place and track your Leebazz order.",
};

const steps = [
  {
    icon: ShoppingBag,
    title: "Choose your pieces",
    description: "Browse the shop, select a product and any available options, then add it to your cart.",
  },
  {
    icon: ClipboardList,
    title: "Review your cart",
    description: "Check your items and quantities. When you’re ready, continue to checkout.",
  },
  {
    icon: CreditCard,
    title: "Add delivery details",
    description: "Sign in to your account and enter the recipient, contact number, and delivery address. Orders are paid by cash on delivery.",
  },
  {
    icon: CircleCheck,
    title: "Place your order",
    description: "Review the order total and delivery information, then submit your order. You’ll see an order confirmation when it’s placed.",
  },
  {
    icon: PackageCheck,
    title: "Follow its progress",
    description: "Visit Track Your Orders to see your order, payment status, and the latest fulfilment updates from our team.",
  },
];

export default function HowToOrderPage() {
  return (
    <main className="page-shell wrap how-to-order-page">
      <header className="page-intro">
        <span className="eyebrow">CUSTOMER GUIDE</span>
        <h1>How to <em>order</em></h1>
        <p>From choosing your pieces to following delivery, here’s how to place an order with Leebazz.</p>
      </header>

      <section className="how-to-order-content" aria-labelledby="how-to-order-title">
        <div className="how-to-order-heading">
          <span className="detail-label">A SIMPLE FIVE-STEP GUIDE</span>
          <h2 id="how-to-order-title">Your next favourite, on its way.</h2>
        </div>
        <ol className="how-to-order-steps">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li className="how-to-order-step" key={title}>
              <span className="how-to-order-step-number">{String(index + 1).padStart(2, "0")}</span>
              <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="how-to-order-actions">
          <Link className="button button-dark" href="/shop">Explore the shop <ArrowUpRight size={16} /></Link>
          <Link className="text-link" href="/track-your-orders">Track your orders</Link>
        </div>
      </section>
    </main>
  );
}
