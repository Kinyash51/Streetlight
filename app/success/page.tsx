import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="success-page success-experience">
      <section className="success-shell">
        <div className="success-glow" aria-hidden="true" />

        <div className="success-copy">
          <p className="section-tag">Payment Successful</p>
          <h1>Your Streetlight access is ready.</h1>
          <p>
            The purchase is complete. Head to your reader home, start reading,
            or download the eBook if this checkout was for The Drowned
            Streetlamp.
          </p>

          <div className="success-actions">
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
            <Link href="/read/chapter-one" className="btn-ghost">
              Start Reading
            </Link>
          </div>
        </div>

        <aside className="success-panel" aria-label="Purchase next steps">
          <p className="reader-kicker">Added to your reader flow</p>
          <div className="success-status">
            <span>Receipt</span>
            <strong>Complete</strong>
          </div>
          <div className="success-status">
            <span>Reader Home</span>
            <strong>Ready</strong>
          </div>
          <div className="success-status">
            <span>Access Sync</span>
            <strong>Supabase next</strong>
          </div>

          <a href="/ebook/the-drowned-streetlamp.pdf" className="success-download">
            Download eBook
          </a>
          <small>
            If this was a membership checkout, your dashboard will show the
            upgraded status after Stripe webhook tracking is connected.
          </small>
        </aside>
      </section>
    </main>
  );
}
