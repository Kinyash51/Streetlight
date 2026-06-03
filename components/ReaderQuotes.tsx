import Link from "next/link";
import FadeIn from "./FadeIn";

const quotes = [
  {
    text: "Streetlight feels like a city that's alive.",
    author: "Early reader",
    detail: "Chapter One private response",
  },
  {
    text: "Dark, beautiful, and haunting.",
    author: "Beta note",
    detail: "Private draft feedback",
  },
  {
    text: "I kept thinking about the characters long after reading.",
    author: "First-chapter reader",
    detail: "Streetlight opening response",
  },
];

export default function ReaderQuotes() {
  return (
    <section className="quotes-section">
      <FadeIn>
        <div className="section-head">
          <p className="section-tag">Reader Reactions</p>
          <h2>What readers are saying</h2>
          <p>Anonymous early notes from people reading the Streetlight world.</p>
        </div>
      </FadeIn>

      <div className="quotes-grid">
        {quotes.map((quote, index) => (
          <FadeIn key={quote.text}>
            <div className="quote-card" key={index}>
              <div className="stars" aria-label="Early reader note">
                Early note
              </div>

              <blockquote>
                <p>&quot;{quote.text}&quot;</p>
              </blockquote>

              <footer className="quote-footer">
                <strong>{quote.author}</strong>
                <span>{quote.detail}</span>
              </footer>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="quotes-cta">
        <p>Start with the first chapter, then decide if the city keeps you.</p>
        <Link href="/read/chapter-one" className="btn-primary">
          Start Reading Free
        </Link>
      </div>
    </section>
  );
}
