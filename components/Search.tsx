"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SearchChapter = {
  slug: string;
  title: string;
  book: string;
  content: string;
  href?: string;
};

type SearchResult = {
  id: string;
  chapterSlug: string;
  chapterTitle: string;
  book: string;
  href: string;
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
        href: chapter.href ?? `/read/${chapter.slug}`,
        before,
        match,
        after,
      });

      index = lowerHaystack.indexOf(cleanQuery, index + cleanQuery.length);
    }
  }

  return results;
}

type SearchTriggerProps = SearchPageProps;

export function SearchTrigger({ chapters }: SearchTriggerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem("streetlight-recent-searches");
      return stored ? JSON.parse(stored).slice(0, 4) : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => findResults(chapters, query), [chapters, query]);
  const activeIndex = results.length ? Math.min(selectedIndex, results.length - 1) : 0;
  const suggestions = [query ? "" : "rain", query ? "" : "streetlamp", query ? "" : "memories"]
    .filter(Boolean)
    .slice(0, 3);

  const rememberSearch = useCallback(
    (term: string) => {
      const cleanTerm = term.trim();

      if (cleanTerm.length < 2) {
        return;
      }

      const nextSearches = [
        cleanTerm,
        ...recentSearches.filter((search) => search !== cleanTerm),
      ].slice(0, 4);

      setRecentSearches(nextSearches);
      window.localStorage.setItem(
        "streetlight-recent-searches",
        JSON.stringify(nextSearches),
      );
    },
    [recentSearches],
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSelectedIndex(0);
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();

    function handleModalKeys(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }

      if (!results.length) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => (current + 1) % results.length);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => (current - 1 + results.length) % results.length);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        rememberSearch(query);
        window.location.href = results[activeIndex].href;
      }
    }

    window.addEventListener("keydown", handleModalKeys);
    return () => window.removeEventListener("keydown", handleModalKeys);
  }, [activeIndex, open, query, rememberSearch, results]);

  return (
    <>
      <button
        type="button"
        className="nav-search-icon"
        onClick={() => {
          setSelectedIndex(0);
          setOpen(true);
        }}
        aria-label="Search Streetlight"
      >
        <span aria-hidden="true">Search</span>
        <kbd>Ctrl K</kbd>
      </button>

      {open ? (
        <div
          className="search-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <section
            className="search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search Streetlight"
          >
            <div className="search-modal-input-wrap">
              <span className="search-modal-icon" aria-hidden="true">
                Search
              </span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search rain, streetlamp, memory..."
                className="search-modal-input"
                autoComplete="off"
              />
              <button
                type="button"
                className="search-modal-close"
                onClick={() => setOpen(false)}
              >
                Esc
              </button>
            </div>

            {query.length < 2 ? (
              <div className="search-modal-section">
                <p className="search-modal-label">
                  {recentSearches.length ? "Recent searches" : "Try searching"}
                </p>
                <div className="search-modal-chips">
                  {(recentSearches.length ? recentSearches : suggestions).map((item) => (
                    <button
                      type="button"
                      className="search-modal-chip"
                      key={item}
                      onClick={() => setQuery(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="search-modal-results" aria-live="polite">
                {results.length ? (
                  results.map((result, index) => (
                    <Link
                      href={result.href}
                      className={`search-modal-result ${
                        activeIndex === index ? "selected" : ""
                      }`}
                      key={result.id}
                      onClick={() => rememberSearch(query)}
                    >
                      <span className="search-modal-result-title">
                        {result.book} - {result.chapterTitle}
                      </span>
                      <span className="search-modal-result-context">
                        {result.before} <mark>{result.match}</mark> {result.after}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="search-modal-empty">
                    <h2>No passage found.</h2>
                    <p>Try a shorter phrase or another image from the chapter.</p>
                  </div>
                )}
              </div>
            )}

            <footer className="search-modal-footer">
              <span>Arrow keys to move</span>
              <span>Enter to open</span>
              <Link href="/search" onClick={() => setOpen(false)}>
                Full search page
              </Link>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
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
                  href={result.href}
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
