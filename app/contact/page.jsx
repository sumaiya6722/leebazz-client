import Link from "next/link";
import { ArrowUpRight, Mail, Phone, Store } from "lucide-react";
import { contactEmail, contactPhones } from "@/lib/site-config";

export const metadata = { title: "Contact Us | Leebazz" };

const demoPhone = "+1 (202) 555-0147";

export default function ContactPage() {
  const phones = contactPhones.length ? contactPhones : [demoPhone];
  const usingDemoPhone = contactPhones.length === 0;

  return (
    <main className="page-shell wrap">
      <div className="page-intro">
        <span className="eyebrow">CUSTOMER CARE</span>
        <h1>Contact us</h1>
        <p>We’re here to help with questions about Leebazz and our collection.</p>
      </div>
      <div className="contact-layout">
        <section className="contact-copy">
          <h2>We’re listening.</h2>
          <p>
            Reach us by phone or email. If you have a question about an item,
            your account, or the website, send it through our FAQ page and our
            team will follow up using the email address you provide.
          </p>
          <div className="contact-detail-list">
            <div className="contact-detail-item">
              <Phone size={17} aria-hidden="true" />
              <div>
                <span className="detail-label">{usingDemoPhone ? "Phone · demo number" : "Phone"}</span>
                {phones.map((phone) => (
                  <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                    {phone}
                  </a>
                ))}
                {usingDemoPhone && (
                  <small>Sample number — replace it with Leebazz’s real contact number before launch.</small>
                )}
              </div>
            </div>
            <div className="contact-detail-item">
              <Mail size={17} aria-hidden="true" />
              <div>
                <span className="detail-label">Email</span>
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                ) : (
                  <span className="contact-placeholder">Email address to be added</span>
                )}
              </div>
            </div>
            <div className="contact-detail-item">
              <Store size={17} aria-hidden="true" />
              <div>
                <span className="detail-label">Website</span>
                <Link href="/">Visit the Leebazz website</Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="contact-support-card">
          <span className="detail-label">CUSTOMER SUPPORT</span>
          <h2>Have a question?</h2>
          <p>
            Send us your name, email address, and message. Your query will be
            saved for our team so they can review it and reply.
          </p>
          <Link className="button button-dark" href="/faq">
            Visit the FAQ page <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
    </main>
  );
}
