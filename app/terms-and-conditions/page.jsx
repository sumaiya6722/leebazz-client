export const metadata = { title: "Terms & Conditions · Leebazz" };

export default function TermsPage() {
  return (
    <main className="page-shell wrap legal-page">
      <div className="page-intro">
        <span className="eyebrow">CORPORATE</span>
        <h1>Terms &amp; Conditions</h1>
        <p>Draft for review before launch</p>
      </div>
      <div className="legal-content">
        <p className="legal-draft-note">
          This page describes the current catalogue demo only. It is not a
          complete set of sales terms.
        </p>
        <section>
          <h2>Catalogue demonstration</h2>
          <p>
            The products, descriptions, prices, stock quantities, and image URLs
            shown here are sample data for storefront development. They are not
            verified live inventory or a promise that an item is available for
            sale.
          </p>
        </section>
        <section>
          <h2>Orders and payments</h2>
          <p>
            This version of the site has no order checkout, payment processing,
            or delivery workflow. Viewing a product or its sample price does not
            place an order.
          </p>
        </section>
        <section>
          <h2>Details to complete</h2>
          <p>
            Before accepting orders, add the seller’s correct business identity
            and contact details, accurate product and price information, and
            final terms for ordering, payment, delivery, returns, cancellations,
            complaints, and applicable law.
          </p>
        </section>
      </div>
    </main>
  );
}
