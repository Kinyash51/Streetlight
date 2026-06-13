"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReaderChapterData } from "@/lib/book-chapters";
import {
  getProgressChapterSlug,
  readReaderBookmarks,
  readReaderProgress,
  type ReaderProgress,
} from "@/lib/reader-progress";

type BookHubProps = {
  chapters: ReaderChapterData[];
  canReadFullBook: boolean;
  isBetaReader: boolean;
};

function chapterReadTime(wordCount = 0) {
  return `${Math.max(1, Math.ceil(wordCount / 210))} min`;
}

export default function BookHub({
  chapters,
  canReadFullBook,
  isBetaReader,
}: BookHubProps) {
  const [progress, setProgress] = useState<ReaderProgress | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(readReaderProgress());
      setBookmarks(readReaderBookmarks());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const activeSlug = progress
    ? getProgressChapterSlug(progress.chapterSlug)
    : chapters[0]?.slug;
  const activeChapter =
    chapters.find((chapter) => chapter.slug === activeSlug) ?? chapters[0];
  const activePercent =
    progress && getProgressChapterSlug(progress.chapterSlug) === activeChapter?.slug
      ? Math.round(progress.progressPercent)
      : 0;
  const continueLabel = activePercent > 0 && activePercent < 95
    ? "Continue reading"
    : activePercent >= 95
      ? "Read again"
      : "Start reading";
  const availableCount = useMemo(
    () =>
      chapters.filter(
        (chapter) => chapter.isFree !== false || canReadFullBook,
      ).length,
    [canReadFullBook, chapters],
  );

  return (
    <main className="book-hub">
      <section className="book-hub-hero">
        <div className="book-hub-cover">
          <Image
            src="/images/book-cover.jpg"
            alt="The Drowned Streetlamp book cover"
            width={720}
            height={1080}
            priority
          />
        </div>

        <div className="book-hub-intro">
          <p className="section-tag">Streetlight · Book One</p>
          <h1>The Drowned Streetlamp</h1>
          <p className="book-hub-subtitle">
            A rain-soaked urban noir story about memory, loneliness, and a city
            that notices the people everyone else forgets.
          </p>

          <div className="book-hub-facts" aria-label="Book details">
            <span>Urban noir</span>
            <span>{chapters.length} chapters</span>
            <span>{availableCount} available to you</span>
            <span>Updated June 2026</span>
          </div>

          <div className="book-hub-actions">
            <Link
              href={`/book?chapter=${activeChapter?.slug ?? "chapter-one"}`}
              className="btn-primary"
            >
              {continueLabel}
            </Link>
            <a href="#chapters" className="btn-ghost">
              View chapters
            </a>
          </div>

          {progress && activeChapter ? (
            <div className="book-hub-progress">
              <div>
                <span>Your progress</span>
                <strong>{activePercent}%</strong>
              </div>
              <div
                className="book-hub-progress-track"
                role="progressbar"
                aria-label={`${activePercent}% complete`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={activePercent}
              >
                <span style={{ width: `${activePercent}%` }} />
              </div>
              <small>
                Chapter {activeChapter.number}: {activeChapter.title}
              </small>
            </div>
          ) : null}
        </div>
      </section>

      <section className="book-hub-library" id="chapters" aria-labelledby="chapters-title">
        <header className="book-hub-library-heading">
          <div>
            <p className="section-tag">Chapter library</p>
            <h2 id="chapters-title">Choose where to enter the city.</h2>
          </div>
          <p>
            Progress and bookmarks stay on this device. Locked chapters open
            automatically for approved beta readers and eligible supporters.
          </p>
        </header>

        <div className="book-chapter-list">
          {chapters.map((chapter, index) => {
            const locked = chapter.isFree === false && !canReadFullBook;
            const isCurrent =
              progress &&
              getProgressChapterSlug(progress.chapterSlug) === chapter.slug;
            const percent = isCurrent ? Math.round(progress.progressPercent) : 0;
            const completed = percent >= 95;
            const bookmarked = bookmarks.includes(chapter.slug);
            const isNew = index === chapters.length - 1;

            return (
              <article
                className={`book-chapter-row ${locked ? "locked" : ""}`}
                key={chapter.slug}
              >
                <div className="book-chapter-number" aria-hidden="true">
                  {String(chapter.number ?? index + 1).padStart(2, "0")}
                </div>

                <div className="book-chapter-details">
                  <div className="book-chapter-badges">
                    <span>{chapter.isFree ? "Free" : isBetaReader ? "Beta access" : "Member"}</span>
                    {completed ? <span className="complete">Completed</span> : null}
                    {isCurrent && !completed ? <span className="current">In progress</span> : null}
                    {bookmarked ? <span>Bookmarked</span> : null}
                    {isNew ? <span className="new">Latest</span> : null}
                  </div>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.subtitle}</p>
                  <div className="book-chapter-meta">
                    <span>{chapterReadTime(chapter.wordCount)}</span>
                    <span>{chapter.wordCount?.toLocaleString()} words</span>
                    {isCurrent ? <span>{percent}% read</span> : null}
                  </div>
                  {isCurrent ? (
                    <div className="book-chapter-progress" aria-hidden="true">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  ) : null}
                </div>

                {locked ? (
                  <Link href="/community" className="book-chapter-action locked">
                    <span>Locked</span>
                    <small>See access</small>
                  </Link>
                ) : (
                  <Link
                    href={`/book?chapter=${chapter.slug}`}
                    className="book-chapter-action"
                  >
                    <span>{isCurrent && !completed ? "Continue" : "Read"}</span>
                    <small>{chapterReadTime(chapter.wordCount)}</small>
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
