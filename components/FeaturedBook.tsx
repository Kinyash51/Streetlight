import Link from "next/link";
import FadeIn from "./FadeIn";
import InteractiveBook from "./InteractiveBook";

export default function FeaturedBook() {
  return (
    <section className="featured-book">
      <FadeIn>
        <div className="featured-container">
          <InteractiveBook />

          <div className="book-content">
            <p className="section-tag">The Book</p>

            <h2>
              The story that started
              <br />
              the Streetlight universe
            </h2>

            <p>
              A rain-soaked urban noir novella exploring memory, loneliness,
              and the quiet violence of survival.
            </p>

            <div className="book-actions">
              <Link href="/book" className="btn-primary">
                View book and chapters
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
