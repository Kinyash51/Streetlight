import Link from "next/link";
import FadeIn from "./FadeIn";

export default function CommunityCTA() {
  return (
    <section className="community-cta">
      <FadeIn>
        <div className="cta-content">
          <p className="section-tag">Community</p>
          <h2>Become a Beta Reader</h2>
          <p>
            Read early chapters, shape future stories, and help build the
            Streetlight universe from the inside.
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <Link href="/beta" className="btn-primary cta-btn">
          Apply to Beta Read
        </Link>
      </FadeIn>
    </section>
  );
}
