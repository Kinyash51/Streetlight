export function DashboardSkeleton() {
  return (
    <main className="dashboard-page reader-dashboard dashboard-app">
      <section className="dashboard-app-shell" aria-label="Loading dashboard">
        <header className="dashboard-app-welcome">
          <div className="skeleton-line skeleton-kicker" />
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-copy" />
        </header>

        <section className="dashboard-app-grid">
          <div className="dashboard-main-stack">
            <article className="reader-panel dashboard-continue-card">
              <div className="skeleton-line skeleton-kicker" />
              <div className="dashboard-book-line">
                <div className="skeleton-book-mark" />
                <div className="skeleton-book-info">
                  <div className="skeleton-line skeleton-meta" />
                  <div className="skeleton-line skeleton-book-title" />
                  <div className="skeleton-line skeleton-book-copy" />
                </div>
              </div>
              <div className="skeleton-progress" />
              <div className="skeleton-actions">
                <div className="skeleton-button" />
                <div className="skeleton-button skeleton-button-ghost" />
              </div>
            </article>

            <div className="dashboard-bottom-grid">
              <article className="reader-panel">
                <div className="skeleton-line skeleton-kicker" />
                <div className="skeleton-list-item" />
                <div className="skeleton-list-item" />
                <div className="skeleton-list-item" />
              </article>
              <article className="reader-panel">
                <div className="skeleton-line skeleton-kicker" />
                <div className="skeleton-line skeleton-book-title" />
                <div className="skeleton-line skeleton-copy" />
                <div className="skeleton-button skeleton-button-ghost" />
              </article>
            </div>
          </div>

          <aside className="dashboard-side-stack">
            <article className="reader-panel">
              <div className="skeleton-line skeleton-kicker" />
              <div className="skeleton-line skeleton-book-title" />
              <div className="skeleton-list-item" />
              <div className="skeleton-list-item" />
            </article>
            <article className="reader-panel">
              <div className="skeleton-line skeleton-kicker" />
              <div className="skeleton-list-item" />
              <div className="skeleton-list-item" />
            </article>
            <article className="reader-panel">
              <div className="skeleton-line skeleton-kicker" />
              <div className="skeleton-line skeleton-email" />
              <div className="skeleton-button" />
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}

export function AccountSkeleton() {
  return (
    <main className="account-page">
      <section className="account-shell" aria-label="Loading account">
        <div className="account-head">
          <div className="skeleton-line skeleton-kicker" />
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-email" />
        </div>

        <section className="account-grid">
          <article className="reader-panel account-wide account-profile-card">
            <div className="skeleton-line skeleton-kicker" />
            <div className="skeleton-line skeleton-book-title" />
            <div className="skeleton-line skeleton-copy" />
            <div className="skeleton-name-row">
              <div className="skeleton-input" />
              <div className="skeleton-button" />
            </div>
          </article>
          <article className="reader-panel">
            <div className="skeleton-line skeleton-kicker" />
            <div className="skeleton-line skeleton-book-title" />
            <div className="skeleton-list-item" />
            <div className="skeleton-list-item" />
          </article>
          <article className="reader-panel">
            <div className="skeleton-line skeleton-kicker" />
            <div className="skeleton-line skeleton-book-title" />
            <div className="skeleton-line skeleton-copy" />
          </article>
        </section>
      </section>
    </main>
  );
}
