"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, Send } from "lucide-react";
import { toast } from "react-toastify";
import { requestFaqApi } from "@/lib/faq-api";

async function fetchFaqPage(targetPage) {
  return requestFaqApi(`/api/admin/faq-queries?page=${targetPage}`);
}

function formatFaqDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(date);
}

export function AdminFaqQueries() {
  const [queries, setQueries] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [replies, setReplies] = useState({});
  const [savingReplyId, setSavingReplyId] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetchFaqPage(1)
      .then((result) => {
        if (!active) return;
        setQueries(result.queries ?? []);
        setHasMore(Boolean(result.hasMore));
        setState({ loading: false, error: "" });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: error.message });
      });
    return () => { active = false; };
  }, [reloadKey]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setLoadMoreError("");
    try {
      const nextPage = page + 1;
      const result = await fetchFaqPage(nextPage);
      setQueries((current) => [...current, ...(result.queries ?? [])]);
      setPage(nextPage);
      setHasMore(Boolean(result.hasMore));
    } catch (error) {
      setLoadMoreError(error.message);
    } finally {
      setLoadingMore(false);
    }
  }

  async function sendReply(item) {
    if (savingReplyId) return;
    const reply = (replies[item.id] ?? item.reply ?? "").trim();
    if (!reply || reply.length > 5000) {
      toast.error("Enter a reply between 1 and 5,000 characters.");
      return;
    }

    setSavingReplyId(item.id);
    try {
      const result = await requestFaqApi(`/api/admin/faq-queries/${encodeURIComponent(item.id)}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      setQueries((current) => current.map((query) => query.id === item.id
        ? { ...query, reply: result.query.reply, repliedAt: result.query.repliedAt, status: result.query.status }
        : query));
      toast.success("Reply saved. The customer will see a notification in their account.");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setSavingReplyId("");
    }
  }

  return (
    <main className="page-shell wrap admin-faq-page">
      <div className="page-intro">
        <span className="eyebrow">ADMIN</span>
        <h1>Customer <em>questions</em></h1>
        <p>Questions submitted through the FAQ page, newest first.</p>
      </div>
      {state.loading ? (
        <p className="admin-faq-state" role="status">Loading questions…</p>
      ) : state.error ? (
        <section className="admin-faq-state is-error" role="alert">
          <h2>Questions could not be loaded</h2>
          <p>{state.error}</p>
          <div className="admin-faq-error-actions">
            <button
              type="button"
              className="button button-dark"
              onClick={() => {
                setState({ loading: true, error: "" });
                setReloadKey((key) => key + 1);
              }}
            >
              Try again
            </button>
            <Link href="/" className="text-link">Return to the storefront <ArrowUpRight size={15} /></Link>
          </div>
        </section>
      ) : queries.length === 0 ? (
        <p className="admin-faq-state">There are no customer questions yet.</p>
      ) : (
        <div className="admin-faq-list">
          {queries.map((item) => (
            <article className="admin-faq-item" key={item.id}>
              <div className="admin-faq-item-heading">
                <div>
                  <h2>{item.name}</h2>
                  <a href={`mailto:${item.email}`}><Mail size={14} />{item.email}</a>
                </div>
                <time dateTime={item.createdAt}>{formatFaqDate(item.createdAt)}</time>
              </div>
              <p>{item.query}</p>
              <div className="admin-faq-reply">
                {item.reply && (
                  <div className="admin-faq-saved-reply">
                    <strong>Current reply</strong>
                    <p>{item.reply}</p>
                    {item.repliedAt && <time dateTime={item.repliedAt}>Replied {formatFaqDate(item.repliedAt)}</time>}
                  </div>
                )}
                <label htmlFor={`faq-reply-${item.id}`}>{item.reply ? "Update reply" : "Write a reply"}</label>
                <textarea
                  id={`faq-reply-${item.id}`}
                  rows={4}
                  maxLength={5000}
                  value={replies[item.id] ?? item.reply ?? ""}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setReplies((current) => ({ ...current, [item.id]: value }));
                  }}
                  placeholder={`Write a response for ${item.name}…`}
                />
                <button
                  type="button"
                  className="button button-dark"
                  disabled={Boolean(savingReplyId)}
                  onClick={() => sendReply(item)}
                >
                  <Send size={14} />
                  {savingReplyId === item.id ? "Saving…" : item.reply ? "Update reply" : "Send reply"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {!state.loading && !state.error && hasMore && (
        <div className="admin-faq-more">
          {loadMoreError && <p role="alert">{loadMoreError}</p>}
          <button type="button" className="button button-dark" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load older questions"}
          </button>
        </div>
      )}
    </main>
  );
}
