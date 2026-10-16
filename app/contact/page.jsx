import { ContactMessageForm } from "@/components/storefront";
import { contactEmail } from "@/lib/site-config";

export const metadata = { title: "Contact Leebazz" };

export default function ContactPage() {
  return;
  <main className="page-shell wrap">
    <div className="page-intro">
      <span className="eyebrow">CUSTOMER CARE</span>
      <h1>Contact</h1>
      <p>Send a message to Leebazz.</p>
    </div>
    <div className="contact-layout">
      <section className="contact-copy">
        <h2>We’re listening.</h2>
        <p>
          Use the form to prepare a message in your email app. You can review it
          there before sending.
        </p>
        <div className="contact-email-block">
          <span className="detail-label">Email</span>
          {contactEmail ? (
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          ) : (
            <span className="contact-placeholder">
              Contact email to be added
            </span>
          )}
        </div>
      </section>
      <ContactMessageForm email={contactEmail} />
    </div>
  </main>;
}
