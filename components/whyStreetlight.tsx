import Link from "next/link";
import FadeIn from "./FadeIn";

export default function WhyStreetlight() {
  return (
    <section className="why-streetlight">
      <div className="why-container">
        <FadeIn>
          <p className="section-tag">Why Streetlight?</p>

          <h2>
            Not every story
            <br />
            is about heroes.
          </h2>

          <blockquote className="why-excerpt">
            <p>
              &quot;Some people are not lost. They are just waiting in places
              the maps forgot to draw.&quot;
            </p>
            <cite>Chapter One</cite>
          </blockquote>

          <p className="why-text">
            Streetlight explores loneliness, memory, poverty, hope, and the
            quiet violence of being forgotten. In this universe, every street
            remembers something. Every shadow hides a story.
          </p>

          <div className="why-actions">
            <Link href="/read/chapter-one" className="btn-primary">
              Read the Opening
            </Link>
            <Link href="/about" className="btn-ghost">
              About the Writer
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
