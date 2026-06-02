"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  readLocalHighlights,
  writeLocalHighlights,
  type LocalHighlight,
} from "@/lib/local-highlights";

function formatHighlightDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Saved locally";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HighlightsPage() {
  const [highlights, setHighlights] = useState<LocalHighlight[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHighlights(readLocalHighlights());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function removeHighlight(id: string) {
    const nextHighlights = highlights.filter((highlight) => highlight.id !== id);

    setHighlights(nextHighlights);
    writeLocalHighlights(nextHighlights);
  }

  return (
    <main className="highlights-page">
      <section className="highlights-shell">
        <div className="highlights-head">
          <p className="section-tag">Reader Notes</p>
          <h1>Your Highlights</h1>
          <p>
            Saved passages from Streetlight live here on this device for now.
            Supabase sync and Patron notes come later.
          </p>
        </div>

        {highlights.length ? (
          <div className="highlights-list">
            {highlights.map((highlight) => (
              <article className="highlight-card" key={highlight.id}>
                <p className="reader-kicker">{highlight.chapterTitle}</p>
                <blockquote>{highlight.text}</blockquote>
                <div className="highlight-meta">
                  <span>{formatHighlightDate(highlight.createdAt)}</span>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => removeHighlight(highlight.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="highlight-empty">
            <h2>No highlights saved yet.</h2>
            <p>
              Go to Chapter One, select a passage, and save it. Your highlights
              will appear here.
            </p>
            <Link href="/read/chapter-one" className="btn-primary">
              Open Chapter One
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}
