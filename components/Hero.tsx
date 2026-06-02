import Link from "next/link";
import FadeIn from "./FadeIn";
import Rain from "./Rain";

export default function Hero() {
  return (
    <section className="hero">
      <Rain />
      <FadeIn>
        <div className="hero-content">
          <p className="hero-eyebrow">Urban Noir Fiction</p>

          <h1 className="hero-title">
            Where the streets <br />
            <em>remember</em> everything.
          </h1>

          <p className="hero-sub">
            A fiction universe built in the shadows. Stories of survival,
            loneliness, and the secrets buried under neon light. By Trevor
            Kinyanjui.
          </p>

          <div className="hero-status-strip">
            <span>Chapter One live</span>
            <span>The Drowned Streetlamp</span>
            <span>Free opening read</span>
          </div>

          <div className="hero-actions">
            <Link href="/read/chapter-one" className="btn-primary hero-cta-main">
              Start Chapter One - Free
            </Link>

            <Link href="/book" className="btn-ghost">
              Explore the Book
            </Link>
          </div>

          <blockquote className="hero-excerpt">
            <p>
              &quot;The rain had been falling for three days when Elias first
              saw the drowned streetlamp.&quot;
            </p>
            <cite>The Drowned Streetlamp</cite>
          </blockquote>
        </div>
      </FadeIn>
    </section>
  );
}
