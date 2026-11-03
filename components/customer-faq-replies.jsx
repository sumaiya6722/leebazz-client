"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CircleHelp, MessageCircleReply } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getMyFaqReplies } from "@/lib/faq-replies-api";

function formatReplyDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-BD", {
        dateStyle: "long",
        timeZone: "Asia/Dhaka",
      }).format(date);
}

export function CustomerFaqReplies() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [queries, setQueries] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState("");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const loading = isPending || Boolean(userId && loadedUserId !== userId);

  useEffect(() => {
    if (isPending || !userId) return;

    let active = true;
    getMyFaqReplies()
      .then((result) => {
        if (!active) return;
        setQueries(result.queries);
        setError("");
        setLoadedUserId(userId);
        window.dispatchEvent(new CustomEvent("leebazz:faq-replies-viewed"));
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        setLoadedUserId(userId);
      });
    return () => { active = false; };
  }, [isPending, userId, reloadKey]);

  return (
    <main className="page-shell wrap customer-faq-replies-page">
      <header className="page-intro">
        <span className="eyebrow">CUSTOMER CARE</span>
        <h1>FAQ <em>replies</em></h1>
        <p>Your questions and the responses from the Leebazz team.</p>
      </header>

      {isPending ? (
        <p className="customer-faq-replies-state" role="status">Loading your questions…</p>
      ) : !userId ? (
        <section className="customer-faq-replies-empty">
          <CircleHelp size={28} strokeWidth={1.4} />
          <h2>Sign in to view your replies</h2>
          <p>Replies to questions linked to your account will appear here.</p>
          <Link className="button button-dark" href="/login">Log in <ArrowUpRight size={15} /></Link>
        </section>
      ) : loading ? (
        <p className="customer-faq-replies-state" role="status">Loading your questions…</p>
      ) : error ? (
        <section className="customer-faq-replies-state is-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="button button-dark"
            onClick={() => {
              setError("");
              setLoadedUserId("");
              setReloadKey((key) => key + 1);
            }}
          >
            Try again
          </button>
        </section>
      ) : queries.length === 0 ? (
        <section className="customer-faq-replies-empty">
          <CircleHelp size={28} strokeWidth={1.4} />
          <h2>No questions yet</h2>
          <p>When you send a question to customer care, it will appear here with its reply.</p>
          <Link className="button button-dark" href="/faq">Ask a question <ArrowUpRight size={15} /></Link>
        </section>
      ) : (
        <div className="customer-faq-replies-list">
          {queries.map((item) => (
            <article className="customer-faq-reply-card" key={item.id}>
              <header>
                <span className={`customer-faq-status${item.reply ? " is-answered" : ""}`}>
                  {item.reply ? "Answered" : "Awaiting reply"}
                </span>
                <time dateTime={item.createdAt}>{formatReplyDate(item.createdAt)}</time>
              </header>
              <h2>Your question</h2>
              <p className="customer-faq-question">{item.query}</p>
              {item.reply ? (
                <section className="customer-faq-answer">
                  <h3><MessageCircleReply size={16} />Leebazz reply</h3>
                  {item.repliedAt && <time dateTime={item.repliedAt}>{formatReplyDate(item.repliedAt)}</time>}
                  <p>{item.reply}</p>
                </section>
              ) : (
                <p className="customer-faq-pending">Our customer care team will respond here as soon as possible.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
