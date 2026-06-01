import Link from "next/link";
import { pricing } from "@/lib/pricing";

export default function ReadPage() {
  return (
    <main className="read-page">
      <article className="chapter-container">
        <p className="section-tag">The Drowned Streetlamp</p>

        <h1>Chapter One</h1>

        <p className="chapter-intro">
          Rain always arrived before the memories.
        </p>

        <p>
          The city never slept. It only dimmed itself long enough for people
          to believe morning was different from night.
        </p>

        <p>
          Under a flickering streetlamp, a boy stood alone, watching water
          crawl through the cracks of the pavement like veins.
        </p>

        <p>
          Nobody looked at him. Nobody ever did.
        </p>

        <p>
          He had learned long ago that being unseen was sometimes safer than
          being noticed.
        </p>

        <div className="chapter-divider" />

        <section className="continue-reading">
          <h2>Want the rest of the story?</h2>

          <p>
            Continue exploring the rain-soaked world of Streetlight and
            discover what waits beneath the city.
          </p>

          <Link href="/checkout" className="btn-primary">
            Buy the eBook for {pricing.ebook.price} one-time
          </Link>
        </section>
      </article>
    </main>
  );
}
