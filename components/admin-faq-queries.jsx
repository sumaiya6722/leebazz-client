"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchFaqPage(targetPage) {
  const response = await fetch(`${API_BASE_URL}/api/admin/faq-queries?page=${targetPage}`, { credentials: "include", cache: "no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Could not load customer questions.");
  return result;
}

export function AdminFaqQueries() {
  const [queries, setQueries] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");

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
  }, []);

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
          <Link href="/" className="text-link">Return to the storefront <ArrowUpRight size={15} /></Link>
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
                <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
              </div>
              <p>{item.query}</p>
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
