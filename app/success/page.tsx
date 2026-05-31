import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="success-page">
      <section className="success-card">
        <p className="section-tag">Payment Successful</p>

        <h1>Thank you for supporting Streetlight.</h1>

        <p>
          Your payment was completed successfully. If you purchased the eBook,
          your download is ready below. If you joined as a Supporter, welcome
          to the growing Streetlight community.
        </p>

        <div className="success-actions">
          <a
            href="/ebook/the-drowned-streetlamp.pdf"
            className="btn-primary"
          >
            Download eBook
          </a>

          <Link href="/community" className="btn-ghost">
            Go to Community
          </Link>
        </div>

        <small>
          More Streetlight features and community benefits are coming soon.
        </small>
      </section>
    </main>
  );
}