import { FaqInquiryForm } from "@/components/faq-inquiry-form";

export const metadata = {
  title: "FAQ & Questions | Leebazz",
  description: "Send a question to the Leebazz customer care team.",
};

export default function FaqPage() {
  return (
    <main className="page-shell wrap">
      <div className="page-intro">
        <span className="eyebrow">CUSTOMER CARE</span>
        <h1>How can we <em>help?</em></h1>
        <p>Send us your question and our team will get back to you by email.</p>
      </div>
      <div className="faq-page-layout">
        <section className="faq-page-copy">
          <span className="detail-label">Ask Leebazz</span>
          <h2>We’re here to help.</h2>
          <p>Enter your name and email for replies, then write your question. Your message will be saved for our team.</p>
          <p className="faq-privacy-note">We’ll store the details you provide so our team can review your question and follow up.</p>
        </section>
        <FaqInquiryForm />
      </div>
    </main>
  );
}
