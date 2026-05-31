import Link from "next/link";
import FadeIn from "./FadeIn";

export default function CommunityCTA() {
  return (
    <section className="community-cta">
      <FadeIn>
        <p className="section-tag">Community</p>
      <h2>Become a Beta Reader</h2>
      <p>
        Read early chapters, shape future stories, and help build the
        Streetlight universe from the inside.
      </p>

        <Link href="/community" className="btn-primary">
          Join the Community
        </Link>
      </FadeIn>
    </section>
  );
}