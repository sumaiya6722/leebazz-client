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
        <p>Send us your question and check your account for the response from our team.</p>
      </div>
      <div className="faq-page-layout">
        <section className="faq-page-copy">
          <span className="detail-label">Ask Leebazz</span>
          <h2>We’re here to help.</h2>
          <p>Enter your name and email, then write your question. If you’re signed in with the same email, your question and reply will also appear in your account.</p>
          <p className="faq-privacy-note">We’ll store the details you provide so our team can review your question and respond.</p>
        </section>
        <FaqInquiryForm />
      </div>
    </main>
  );
}
