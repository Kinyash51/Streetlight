import Link from "next/link";
import Image from "next/image";
import { pricing } from "@/lib/pricing";

export default function BookPage() {
  return (
    <main className="book-page">
      <section className="book-hero-section">

        <Image
                  src="/images/book-cover.jpg"
                  alt="The Drowned Streetlamp book cover"
                  width={320}
                  height={480}
                  className="book-cover-image"
                />

        <div className="book-details">
          <p className="section-tag">A Streetlight Novella</p>

          <h1>The Drowned Streetlamp</h1>

          <p>
            A homeless teenager drifting through a rain-soaked city is pulled
            into a hidden world operating beneath the neon glow of the streets.
          </p>
          <p>
            <strong>{pricing.ebook.price}</strong> {pricing.ebook.billing}.
          </p>

          <div className="book-actions">
            <Link href="/read/chapter-one" className="btn-ghost">
              Read Chapter One
            </Link>

            <Link href={pricing.ebook.href} className="btn-primary">
              Buy eBook
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
