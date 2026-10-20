export function CatalogLoading({ label = "collection", showBreadcrumbs = false }) {
  return (
    <main
      className="page-shell wrap catalog-loading"
      aria-busy="true"
      aria-label={`Loading ${label}`}
    >
      <span className="sr-only" role="status">Loading {label}…</span>
      {showBreadcrumbs && (
        <div className="breadcrumbs" aria-hidden="true">
          <span className="skeleton-line skeleton-crumb" />
          <span>/</span>
          <span className="skeleton-line skeleton-crumb" />
        </div>
      )}
      <div className="page-intro">
        <span className="skeleton-line skeleton-kicker" aria-hidden="true" />
        <span className="skeleton-line catalog-loading-title" aria-hidden="true" />
        <span className="skeleton-line catalog-loading-description" aria-hidden="true" />
      </div>
      <div className="subcategory-list" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span className="skeleton-line catalog-loading-chip" key={index} />
        ))}
      </div>
      <div className="catalog-loading-grid" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="catalog-loading-card" key={index}>
            <div className="skeleton-block" />
            <span className="skeleton-line catalog-loading-meta" />
            <span className="skeleton-line catalog-loading-name" />
            <span className="skeleton-line catalog-loading-price" />
          </div>
        ))}
      </div>
    </main>
  );
}
