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
          <em>remember</em> everything
        </h1>

        <p className="hero-sub">
          A fiction universe built in the shadows. Stories of survival,
          loneliness, and the secrets buried under neon light. By Trevor
          Kinyanjui.
        </p>

        <div className="hero-actions">
          <Link href="/book" className="btn-primary">
            Read The Drowned Streetlamp
          </Link>

          <Link href="/community" className="btn-ghost">
            Join as Beta Reader
          </Link>
        </div>
      </div>
        </FadeIn>
    </section>
  );
}