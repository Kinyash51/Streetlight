import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="page-hero">
        <p className="section-tag">The Writer</p>
        <h1>Trevor Kinyanjui</h1>
        <p>
          Urban noir fiction writer building the Streetlight universe from
          Nairobi, Kenya.
        </p>
      </section>

      <section className="about-content">
        <div className="author-mark">✍️</div>

        <div>
          <h2>I write about the people cities forget.</h2>

          <p>
            Streetlight began with one image: a streetlamp reflected in rain.
            From that came Elias. From Elias came The Drowned Streetlamp. From
            that came a universe still growing.
          </p>

          <p>
            This world is built around survival, loneliness, memory, and the
            quiet strength of people living in the margins.
          </p>

          <div className="about-actions">
            <Link href="/book" className="btn-primary">
              Read the Book
            </Link>

            <Link href="/community" className="btn-ghost">
              Join the Community
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}