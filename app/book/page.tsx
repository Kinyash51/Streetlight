import Link from "next/link";
import Image from "next/image";

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

          <div className="book-actions">
            <Link href="/read" className="btn-ghost">
              Read Chapter One
            </Link>

            <Link href="https://buy.stripe.com/test_eVqfZj4Vg7Ro3294p77kc00" className="btn-primary">
              Buy eBook
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}