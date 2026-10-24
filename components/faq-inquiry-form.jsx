"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function FaqInquiryForm() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sending, setSending] = useState(false);

  async function submitInquiry(event) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus({ type: "", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      query: String(formData.get("query") ?? "").trim(),
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/faq-queries`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We could not send your question. Please try again.");
      form.reset();
      setStatus({ type: "", message: "" });
      toast.success("Your question has been sent successfully.");
    } catch (error) {
      setStatus({ type: "error", message: error.message || "We could not send your question. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="faq-inquiry-form" onSubmit={submitInquiry}>
      <label>
        Your name
        <input name="name" autoComplete="name" maxLength={100} required />
      </label>
      <label>
        Your email address
        <input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" />
      </label>
      <label>
        Your question
        <textarea name="query" rows={6} maxLength={5000} required />
      </label>
      <label className="faq-honeypot" aria-hidden="true" tabIndex={-1}>
        Leave this field empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button button-dark" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Send your question"}
        <ArrowUpRight size={16} />
      </button>
      {status.message && <p className={`faq-form-status is-${status.type}`} role="status">{status.message}</p>}
      <p className="faq-form-note">Your name, email, and question will be stored so our team can review and respond.</p>
    </form>
  );
}
