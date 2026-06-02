"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SearchChapter = {
  slug: string;
  title: string;
  book: string;
  content: string;
};

type SearchResult = {
  id: string;
  chapterSlug: string;
  chapterTitle: string;
  book: string;
  before: string;
  match: string;
  after: string;
};

type SearchPageProps = {
  chapters: SearchChapter[];
};

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function findResults(chapters: SearchChapter[], query: string): SearchResult[] {
  const cleanQuery = normalize(query);

  if (cleanQuery.length < 2) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const chapter of chapters) {
    const haystack = chapter.content;
    const lowerHaystack = haystack.toLowerCase();
    let index = lowerHaystack.indexOf(cleanQuery);

    while (index !== -1 && results.length < 24) {
      const beforeStart = Math.max(0, index - 100);
      const afterEnd = Math.min(haystack.length, index + cleanQuery.length + 130);
      const before = haystack.slice(beforeStart, index).trimStart();
      const match = haystack.slice(index, index + cleanQuery.length);
      const after = haystack.slice(index + cleanQuery.length, afterEnd).trimEnd();

      results.push({
        id: `${chapter.slug}-${index}`,
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
        book: chapter.book,
        before,
        match,
        after,
      });

      index = lowerHaystack.indexOf(cleanQuery, index + cleanQuery.length);
    }
  }

  return results;
}

export function SearchPage({ chapters }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => findResults(chapters, query), [chapters, query]);
  const suggestions = ["rain", "streetlamp", "city", "memories", "boy"];

  return (
    <main className="search-page">
      <section className="search-page-shell">
        <header className="search-page-head">
          <p className="section-tag">Search</p>
          <h1>Find a line in Streetlight.</h1>
          <p>
            Search the available chapters, passages, and recurring images in
            The Drowned Streetlamp.
          </p>
        </header>

        <div className="search-page-input-wrapper">
          <span className="search-page-input-icon" aria-hidden="true">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rain, streetlamp, city..."
            className="search-page-input"
            autoComplete="off"
            autoFocus
          />
          {query ? (
            <button
              type="button"
              className="search-page-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              Clear
            </button>
          ) : null}
        </div>

        {query.length < 2 ? (
          <section className="search-suggestions" aria-label="Search suggestions">
            <p className="search-suggestions-label">Try searching</p>
            {suggestions.map((suggestion) => (
              <button
                type="button"
                className="search-suggestion-chip"
                key={suggestion}
                onClick={() => setQuery(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </section>
        ) : null}

        {query.length >= 2 ? (
          <section className="search-page-results" aria-live="polite">
            <p className="search-results-count">
              {results.length
                ? `${results.length} result${results.length === 1 ? "" : "s"}`
                : `No results for "${query}"`}
            </p>

            {results.length ? (
              results.map((result) => (
                <Link
                  href={`/read/${result.chapterSlug}`}
                  className="search-result-card"
                  key={result.id}
                >
                  <div className="search-result-card-header">
                    <span className="search-result-card-chapter">
                      {result.book} - {result.chapterTitle}
                    </span>
                    <span className="search-result-card-position">Open chapter</span>
                  </div>
                  <p className="search-result-card-context">
                    <span>{result.before}</span>{" "}
                    <mark>{result.match}</mark>{" "}
                    <span>{result.after}</span>
                  </p>
                </Link>
              ))
            ) : (
              <div className="search-page-empty">
                <h2>No passage found.</h2>
                <p>Try a shorter word or search for another image from the story.</p>
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}
