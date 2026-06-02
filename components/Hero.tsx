import Link from "next/link";
import FadeIn from "./FadeIn";
import Rain from "./Rain";  

export default function Hero() {
  return (
    <section className="hero">
        <Rain />
        <FadeIn>
      <div>
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

        <div className="hero-actions">
          <Link href="/read/chapter-one" className="btn-primary">
            Start Chapter One
          </Link>

          <Link href="/book" className="btn-ghost">
            Explore the Book
          </Link>
        </div>
      </div>
        </FadeIn>
    </section>
  );
}
