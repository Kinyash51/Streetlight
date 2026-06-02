import Image from "next/image";
import Link from "next/link";
import { pricing } from "@/lib/pricing";

const bookIncludes = [
  "The Drowned Streetlamp eBook",
  "One-time purchase, not a subscription",
  "Chapter One available to read free first",
  "Access ready to connect with your Streetlight account",
];

const storyNotes = [
  {
    title: "Urban noir",
    text: "A rain-soaked city where streets remember what people try to forget.",
  },
  {
    title: "A vulnerable lead",
    text: "Elias is not a hero with power. He is a survivor who sees what others miss.",
  },
  {
    title: "A larger world",
    text: "The drowned streetlamp is only the first door into the Streetlight universe.",
  },
];

export default function BookPage() {
  return (
    <main className="book-page book-product-page">
      <section className="book-product-hero">
        <div className="book-product-cover-wrap">
          <Image
            src="/images/book-cover.jpg"
            alt="The Drowned Streetlamp book cover"
            width={360}
            height={540}
            className="book-product-cover"
            priority
          />
        </div>

        <div className="book-product-copy">
          <p className="section-tag">A Streetlight Novella</p>
          <h1>The Drowned Streetlamp</h1>
          <p className="book-product-lede">
            A homeless teenager drifting through a rain-soaked city is pulled
            into a hidden world operating beneath the neon glow of the streets.
          </p>

          <div className="book-purchase-panel">
            <div>
              <span>eBook</span>
              <strong>{pricing.ebook.price}</strong>
              <p>{pricing.ebook.billing}</p>
            </div>
            <div className="book-purchase-actions">
              <Link href={pricing.ebook.href} className="btn-primary">
                Buy eBook
              </Link>
              <Link href="/read/chapter-one" className="btn-ghost">
                Start Chapter One Free
              </Link>
            </div>
          </div>

          <p className="book-product-note">
            The eBook is a one-time purchase. Membership tiers are separate and
            monthly.
          </p>
        </div>
      </section>

      <section className="book-synopsis-section">
        <div className="book-synopsis">
          <p className="section-tag">The Story</p>
          <h2>A city that remembers everyone it breaks.</h2>
          <p>
            Elias knows which doorways stay dry, which alleys to avoid, and
            which streetlamps flicker before they die. But when he finds a
            streetlamp burning underwater, the city stops being background and
            starts looking back.
          </p>
          <p>
            The Drowned Streetlamp is the opening book in the Streetlight
            universe: urban noir fiction about memory, loneliness, survival, and
            the hidden systems beneath ordinary streets.
          </p>
        </div>
      </section>

      <section className="book-includes-section">
        <div className="book-includes-grid">
          <div className="book-includes-card">
            <p className="section-tag">What You Get</p>
            <h2>Simple access. No tier confusion.</h2>
            <ul>
              {bookIncludes.map((item) => (
                <li key={item}>
                  <span aria-hidden="true">Included</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="book-trust-card">
            <p className="section-tag">Before You Buy</p>
            <h2>Read first.</h2>
            <p>
              Start with Chapter One for free. If the city keeps you, the eBook
              is available as a one-time purchase.
            </p>
            <Link href="/read/chapter-one" className="btn-ghost">
              Read the Opening
            </Link>
          </div>
        </div>
      </section>

      <section className="book-world-section">
        <div className="book-world-head">
          <p className="section-tag">Inside the Book</p>
          <h2>What the story is built on.</h2>
        </div>

        <div className="book-world-grid">
          {storyNotes.map((note) => (
            <article className="book-world-card" key={note.title}>
              <h3>{note.title}</h3>
              <p>{note.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="book-final-cta">
        <div className="book-final-inner">
          <h2>Begin with the rain.</h2>
          <p>
            Read the free opening chapter, then buy the eBook if The Drowned
            Streetlamp feels like your kind of city.
          </p>
          <div className="book-final-actions">
            <Link href="/read/chapter-one" className="btn-ghost">
              Start Chapter One Free
            </Link>
            <Link href={pricing.ebook.href} className="btn-primary">
              Buy eBook - {pricing.ebook.price}
            </Link>
          </div>
          <Link href="/community" className="book-community-link">
            Looking for memberships? Visit the Community page.
          </Link>
        </div>
      </section>
    </main>
  );
}
