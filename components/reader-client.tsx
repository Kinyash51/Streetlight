"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { pricing } from "@/lib/pricing";

type Chapter = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  isFree: boolean;
  wordCount: number;
  content: Array<{
    type: "paragraph" | "break";
    text: string;
  }>;
};

type ClientAccess = {
  canReadChapterOne: boolean;
  canReadFullBook: boolean;
  canReadEarlyChapters: boolean;
  canAccessSupporterNotes: boolean;
  canAccessPatronExtras: boolean;
};

type ReaderClientProps = {
  chapters: Chapter[];
  currentChapterId: string;
  access: ClientAccess;
  userId: string | null;
};

export function ReaderClient({
  chapters,
  currentChapterId,
  access,
  userId,
}: ReaderClientProps) {
  const [activeChapter, setActiveChapter] = useState(currentChapterId);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showTOC, setShowTOC] = useState(false);
  const router = useRouter();

  const currentChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === activeChapter) ?? chapters[0],
    [activeChapter, chapters]
  );
  const currentIndex = chapters.findIndex((chapter) => chapter.id === activeChapter);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min((window.scrollY / maxScroll) * 100, 100) : 0;
      setReadingProgress(progress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeChapter]);

  useEffect(() => {
    if (!userId) return;

    localStorage.setItem(
      `streetlight-progress-${userId}`,
      JSON.stringify({
        chapter: activeChapter,
        progress: readingProgress,
        timestamp: Date.now(),
      })
    );
  }, [activeChapter, readingProgress, userId]);

  const handleChapterChange = (chapterId: string) => {
    const chapter = chapters.find((item) => item.id === chapterId);
    if (!chapter || (!chapter.isFree && !access.canReadFullBook)) return;

    setActiveChapter(chapterId);
    setShowTOC(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(`/book?chapter=${chapterId}`, { scroll: false });
  };

  const previousChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="reader-container">
      <div className="reader-progress-bar" aria-hidden="true">
        <div className="reader-progress-fill" style={{ width: `${readingProgress}%` }} />
      </div>

      <header className="reader-header">
        <button
          className="reader-toc-toggle"
          type="button"
          onClick={() => setShowTOC((value) => !value)}
          aria-expanded={showTOC}
          aria-label="Open table of contents"
        >
          <span aria-hidden="true">☰</span>
          Contents
        </button>

        <div className="reader-chapter-info">
          <span className="reader-chapter-number">Chapter {currentChapter.number}</span>
          <span className="reader-chapter-title">{currentChapter.title}</span>
        </div>

        <div className="reader-meta">
          <span className="reader-word-count">{currentChapter.wordCount.toLocaleString()} words</span>
          {!currentChapter.isFree && access.canReadFullBook ? (
            <span className="reader-access-badge">Unlocked</span>
          ) : null}
        </div>
      </header>

      {showTOC ? (
        <div className="reader-toc-overlay" onClick={() => setShowTOC(false)}>
          <aside className="reader-toc" onClick={(event) => event.stopPropagation()}>
            <div className="reader-toc-header">
              <h2>The Drowned Streetlamp</h2>
              <button type="button" onClick={() => setShowTOC(false)} aria-label="Close contents">
                ×
              </button>
            </div>

            <div className="reader-toc-chapters">
              {chapters.map((chapter) => {
                const isLocked = !chapter.isFree && !access.canReadFullBook;
                const isActive = chapter.id === activeChapter;

                return (
                  <button
                    key={chapter.id}
                    className={`reader-toc-item ${isActive ? "active" : ""} ${
                      isLocked ? "locked" : ""
                    }`}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleChapterChange(chapter.id)}
                  >
                    <span className="toc-number">{chapter.number}</span>
                    <span className="toc-info">
                      <span className="toc-title">{chapter.title}</span>
                      <span className="toc-subtitle">{chapter.subtitle}</span>
                    </span>
                    {chapter.isFree ? <span className="toc-badge free">Free</span> : null}
                    {isLocked ? <span className="toc-lock">Locked</span> : null}
                    {!isLocked && !chapter.isFree ? (
                      <span className="toc-badge unlocked">Open</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {!access.canReadFullBook ? (
              <div className="reader-toc-cta">
                <p>Unlock the rest of the story.</p>
                <Link href="/community" className="btn-primary">
                  View Access
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}

      <article className="reader-content">
        <div className="reader-chapter-header">
          <span className="reader-chapter-label">Chapter {currentChapter.number}</span>
          <h1>{currentChapter.title}</h1>
          <p className="reader-chapter-subtitle">{currentChapter.subtitle}</p>
          {currentChapter.isFree ? <span className="reader-free-badge">Free preview</span> : null}
          {!currentChapter.isFree && access.canReadFullBook ? (
            <span className="reader-unlocked-badge">Full access</span>
          ) : null}
        </div>

        <div className="reader-text">
          {currentChapter.content.map((block, index) =>
            block.type === "break" ? (
              <div className="reader-break" key={`${block.text}-${index}`}>
                <span>{block.text}</span>
              </div>
            ) : (
              <p className="reader-paragraph" key={`${block.text}-${index}`}>
                {block.text}
              </p>
            )
          )}
        </div>

        <div className="reader-chapter-nav">
          {previousChapter ? (
            <button
              className="reader-nav-btn prev"
              type="button"
              onClick={() => handleChapterChange(previousChapter.id)}
            >
              <span className="nav-label">Previous</span>
              <span className="nav-chapter">{previousChapter.title}</span>
            </button>
          ) : null}

          {nextChapter ? (
            <button
              className={`reader-nav-btn next ${
                !nextChapter.isFree && !access.canReadFullBook ? "locked" : ""
              }`}
              type="button"
              disabled={!nextChapter.isFree && !access.canReadFullBook}
              onClick={() => handleChapterChange(nextChapter.id)}
            >
              <span className="nav-label">
                {!nextChapter.isFree && !access.canReadFullBook ? "Locked" : "Next"}
              </span>
              <span className="nav-chapter">{nextChapter.title}</span>
            </button>
          ) : null}
        </div>

        {currentChapter.isFree && !access.canReadFullBook ? (
          <section className="reader-lock-message" aria-labelledby="reader-lock-title">
            <span className="lock-icon" aria-hidden="true">
              Lock
            </span>
            <h2 id="reader-lock-title">Chapter Two continues the story</h2>
            <p>
              Elias descends into the Underground. The city reveals its hidden layers. The light
              that sent him is only the beginning.
            </p>
            <div className="lock-features">
              <span>Full eBook access</span>
              <span>Early chapter previews</span>
              <span>Behind-the-scenes notes</span>
            </div>
            <div className="reader-lock-actions">
              <Link href={pricing.ebook.href} className="btn-primary btn-large">
                Buy eBook - {pricing.ebook.price}
              </Link>
              <Link href="/community" className="btn-ghost">
                View Memberships
              </Link>
            </div>
            <p className="lock-note">
              The eBook is a {pricing.ebook.billing}. Memberships stay monthly.
            </p>
          </section>
        ) : null}
      </article>
    </div>
  );
}
