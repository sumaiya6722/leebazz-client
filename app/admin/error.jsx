"use client";

export default function AdminError({ reset }) {
  return (
    <main className="admin-page">
      <section className="admin-empty-panel admin-error-panel" role="alert">
        <span className="eyebrow">SOMETHING WENT WRONG</span>
        <h1>This dashboard section could not be loaded.</h1>
        <p>Please retry. If the issue continues, check the application server logs.</p>
        <button className="admin-retry-button" type="button" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
