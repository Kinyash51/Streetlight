import Link from "next/link";
import FadeIn from "@/components/FadeIn";

const milestones = [
  {
    marker: "Origin",
    title: "The first image",
    desc: "A streetlamp reflected in rain. The image that started the mood, the city, and the question behind the story.",
  },
  {
    marker: "Draft",
    title: "Elias takes shape",
    desc: "A homeless teenager who notices what everyone else steps over became the center of The Drowned Streetlamp.",
  },
  {
    marker: "Now",
    title: "Chapter One is live",
    desc: "The opening chapter is public, and the Streetlight world is growing into a larger reading platform.",
  },
  {
    marker: "Next",
    title: "The city expands",
    desc: "More chapters, more lore files, and deeper character threads are being built around the same rain-soaked universe.",
  },
];

const influences = [
  {
    name: "African storytelling",
    work: "Place, memory, survival",
    why: "Streetlight is built around people, streets, pressure, and the stories a city tries to bury.",
  },
  {
    name: "Noir fiction",
    work: "Cities as characters",
    why: "The city is not only a setting. It watches, remembers, and changes the people inside it.",
  },
  {
    name: "Speculative fiction",
    work: "The impossible made intimate",
    why: "The strange parts of Streetlight stay close to human pain, hunger, hope, and memory.",
  },
  {
    name: "Urban life",
    work: "Margins and movement",
    why: "The world focuses on people who keep moving because stopping would mean being swallowed.",
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <FadeIn>
          <p className="section-tag">The Writer</p>
          <h1>Trevor Kinyanjui</h1>
          <p className="about-hero-sub">
            Urban noir fiction writer building the Streetlight universe from
            Nairobi, Kenya.
          </p>
        </FadeIn>
      </section>

      <section className="about-statement">
        <FadeIn>
          <div className="about-statement-inner">
            <aside className="about-portrait" aria-label="Writer profile">
              <div className="about-portrait-placeholder" aria-hidden="true">
                TK
              </div>
              <div className="about-portrait-meta">
                <strong>Trevor Kinyanjui</strong>
                <span>Nairobi, Kenya</span>
              </div>
            </aside>

            <div className="about-statement-text">
              <h2>I write about the people cities forget.</h2>

              <p>
                Streetlight began with one image: a streetlamp reflected in
                rain. From that came Elias. From Elias came The Drowned
                Streetlamp. From that came a universe still growing.
              </p>

              <p>
                This world is built around survival, loneliness, memory, and
                the quiet strength of people living in the margins. Streetlight
                looks at the people a city passes every day, then asks what the
                city remembers about them.
              </p>

              <p>
                It is noir, but not just for mystery. It is darkness used to
                reveal what daylight ignores.
              </p>

              <blockquote className="about-quote">
                <p>
                  &quot;Every street remembers something. Every shadow hides a
                  story. Every person is carrying more than they are willing to
                  admit.&quot;
                </p>
                <cite>Streetlight</cite>
              </blockquote>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="about-timeline-section">
        <FadeIn>
          <div className="about-timeline-inner">
            <p className="section-tag">The Journey</p>
            <h2>How Streetlight began.</h2>

            <div className="about-timeline">
              {milestones.map((milestone) => (
                <article className="about-timeline-item" key={milestone.title}>
                  <span className="about-timeline-dot" aria-hidden="true" />
                  <div className="about-timeline-content">
                    <span className="about-timeline-year">{milestone.marker}</span>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="about-influences">
        <FadeIn>
          <div className="about-influences-inner">
            <p className="section-tag">Influences</p>
            <h2>What shapes the world.</h2>

            <div className="influences-grid">
              {influences.map((influence) => (
                <article className="influence-card" key={influence.name}>
                  <h3>{influence.name}</h3>
                  <span className="influence-work">{influence.work}</span>
                  <p>{influence.why}</p>
                </article>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="about-connect">
        <FadeIn>
          <div className="about-connect-inner">
            <h2>Stay in the light.</h2>
            <p>
              Start with the free chapter, then explore the city, the community,
              and the world behind The Drowned Streetlamp.
            </p>

            <div className="about-connect-actions">
              <Link href="/read/chapter-one" className="btn-primary">
                Read Chapter One Free
              </Link>
              <Link href="/community" className="btn-ghost">
                Join the Community
              </Link>
              <Link href="/universe" className="btn-ghost">
                Explore the Universe
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
