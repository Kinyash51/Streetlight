import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="cancel-page">
      <section className="success-card">
        <p className="section-tag">Payment Cancelled</p>

        <h1>No worries.</h1>

        <p>
          Your payment was not completed. You can return to checkout whenever
          you're ready.
        </p>

        <div className="success-actions">
          <Link href="/checkout" className="btn-primary">
            Return to Checkout
          </Link>

          <Link href="/book" className="btn-ghost">
            Back to Book
          </Link>
        </div>
      </section>
    </main>
  );
}