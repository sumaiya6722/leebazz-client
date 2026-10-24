import Link from "next/link";
import { ArrowUpRight, Heart, ShoppingBag, UserRound } from "lucide-react";

export const metadata = {
  title: "Membership | Leebazz",
  description: "Create a Leebazz account to save products and manage your profile.",
};

const benefits = [
  {
    icon: Heart,
    title: "Keep your wishlist",
    description: "Save pieces you like and return to them whenever you browse.",
  },
  {
    icon: ShoppingBag,
    title: "Keep track of your cart",
    description: "Your saved cart is linked to your account, ready for your next visit.",
  },
  {
    icon: UserRound,
    title: "Manage your profile",
    description: "Update your name and profile image from your account page.",
  },
];

export default function MembershipPage() {
  return (
    <main className="page-shell wrap membership-page">
      <div className="page-intro">
        <span className="eyebrow">YOUR LEEBAZZ ACCOUNT</span>
        <h1>Membership at Leebazz</h1>
        <p>A simple account helps you keep the pieces you love close at hand.</p>
      </div>

      <section className="membership-intro">
        <div>
          <span className="detail-label">A FREE CUSTOMER ACCOUNT</span>
          <h2>Make Leebazz yours.</h2>
          <p>
            Create a Leebazz account to save products to your wishlist, keep your
            cart connected to you, and manage your profile. Membership currently
            means having an account on the site; there is no fee to join.
          </p>
          <div className="membership-actions">
            <Link className="button button-dark" href="/signUp">
              Create an account <ArrowUpRight size={16} />
            </Link>
            <Link className="text-link" href="/login">Already a member? Log in</Link>
          </div>
        </div>
        <div className="membership-note">
          <strong>Just getting started</strong>
          <p>
            Leebazz is currently a catalogue demo. Checkout, order delivery,
            member points, rewards, and member-only discounts are not available
            yet. We’ll update this page if membership benefits change.
          </p>
        </div>
      </section>

      <section className="membership-benefits" aria-labelledby="membership-benefits-title">
        <span className="eyebrow">ACCOUNT BENEFITS</span>
        <h2 id="membership-benefits-title">Useful things, all in one place.</h2>
        <div className="membership-benefit-grid">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article className="membership-benefit" key={title}>
              <Icon size={21} strokeWidth={1.5} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="membership-reward" aria-labelledby="membership-reward-title">
        <span className="membership-reward-label">UPCOMING MEMBER OFFER</span>
        <h2 id="membership-reward-title">A little something for your next purchase.</h2>
        <p>
          Members who spend more than BDT 5,000 in a purchase will be eligible
          for a discount on a selected product on their next purchase.
        </p>
        <p className="membership-reward-note">
          This offer is not active yet. The current catalogue demo cannot process
          or verify purchases. The discount amount, selected product, and full
          offer terms will be published before the reward launches.
        </p>
      </section>

      <p className="membership-help">
        Need help with your account? <Link href="/faq">Send us a question through the FAQ page.</Link>
      </p>
    </main>
  );
}
