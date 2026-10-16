export const metadata = { title: "Privacy Policy · Leebazz" };

export default function PrivacyPolicyPage() {
  return (
    <main className="page-shell wrap legal-page">
      <div className="page-intro">
        <span className="eyebrow">CORPORATE</span>
        <h1>Privacy Policy</h1>
        <p>Draft for review before launch</p>
      </div>
      <div className="legal-content">
        <p className="legal-draft-note">
          This page is a starting point for the current Leebazz catalogue demo.
          It needs to be updated to reflect the actual business, hosting setup,
          and data practices before the storefront goes live.
        </p>
        <section>
          <h2>What this demo does</h2>
          <p>
            The current storefront displays catalogue information. It does not
            provide customer accounts, checkout, or payment processing.
          </p>
        </section>
        <section>
          <h2>Messages</h2>
          <p>
            The contact form prepares a message in your email app. The form
            itself does not submit or store the message on this website. If you
            send the email, your email provider will handle it and the recipient
            will receive the details you include.
          </p>
        </section>
        <section>
          <h2>Details to complete</h2>
          <p>
            Before launch, add accurate information about the business that
            operates this site, technical logs and cookies, any analytics or
            service providers, what personal information is collected and why,
            how long it is retained, and how people can make privacy requests.
          </p>
        </section>
      </div>
    </main>
  );
}
