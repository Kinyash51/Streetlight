import Link from "next/link";
import FadeIn from "./FadeIn";

const items = [
  ["The City", "A nameless rain-soaked city that remembers everyone it breaks."],
  ["The Underground", "A hidden network operating beneath the streets."],
  ["The Forgotten", "People the city erased, but never fully destroyed."],
  ["Perpetual Rain", "The weather is not background. It is part of the world."],
];

export default function UniversePreview() {
  return (
    <section className="universe-preview">
        <FadeIn>
      <div className="section-head">
        <p className="section-tag">The Universe</p>
        <h2>The city is more than a setting.</h2>
        <p>
          Every alley, streetlamp, and shadow belongs to something larger.
        </p>
      </div>

      <div className="universe-grid">
        {items.map(([title, text]) => (
          <div className="universe-card" key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>

      <Link href="/universe" className="btn-primary">
        Explore the Universe
      </Link>
        </FadeIn>
    </section>
  );
}