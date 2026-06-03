"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pricing } from "@/lib/pricing";

interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  isFree: boolean;
  wordCount: number;
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface ClientAccess {
  canReadChapterOne: boolean;
  canReadFullBook: boolean;
  canReadEarlyChapters: boolean;
  canAccessSupporterNotes: boolean;
  canAccessPatronExtras: boolean;
}

interface ReaderClientProps {
  chapters: Chapter[];
  currentChapterId: string;
  access: ClientAccess;
  userId: string | null;
}

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

  const currentChapter =
    chapters.find((chapter) => chapter.id === activeChapter) || chapters[0];
  const currentIndex = chapters.findIndex(
    (chapter) => chapter.id === activeChapter
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setReadingProgress(progress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeChapter]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem(
        `streetlight-progress-${userId}`,
        JSON.stringify({
          chapter: activeChapter,
          progress: readingProgress,
          timestamp: Date.now(),
        })
      );
    }
  }, [readingProgress, activeChapter, userId]);

  const handleChapterChange = (chapterId: string) => {
    const chapter = chapters.find((item) => item.id === chapterId);
    if (!chapter) return;

    if (!chapter.isFree && !access.canReadFullBook) {
      return;
    }

    setActiveChapter(chapterId);
    setShowTOC(false);
    window.scrollTo(0, 0);
    router.push(`/book?chapter=${chapterId}`, { scroll: false });
  };

  const goToNextChapter = () => {
    if (currentIndex < chapters.length - 1) {
      handleChapterChange(chapters[currentIndex + 1].id);
    }
  };

  const goToPrevChapter = () => {
    if (currentIndex > 0) {
      handleChapterChange(chapters[currentIndex - 1].id);
    }
  };

  return (
    <div className="reader-container">
      <div className="reader-progress-bar">
        <div
          className="reader-progress-fill"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <header className="reader-header">
        <button
          className="reader-toc-toggle"
          onClick={() => setShowTOC(!showTOC)}
          aria-label="Table of contents"
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          Contents
        </button>

        <div className="reader-chapter-info">
          <span className="reader-chapter-number">
            Chapter {currentChapter.number}
          </span>
          <span className="reader-chapter-title">{currentChapter.title}</span>
        </div>

        <div className="reader-meta">
          <span className="reader-word-count">
            {currentChapter.wordCount.toLocaleString()} words
          </span>
          {!currentChapter.isFree && access.canReadFullBook && (
            <span className="reader-access-badge">Unlocked</span>
          )}
        </div>
      </header>

      {showTOC && (
        <div className="reader-toc-overlay" onClick={() => setShowTOC(false)}>
          <div className="reader-toc" onClick={(event) => event.stopPropagation()}>
            <div className="reader-toc-header">
              <h3>The Drowned Streetlamp</h3>
              <button
                onClick={() => setShowTOC(false)}
                aria-label="Close"
                type="button"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
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
                    onClick={() => handleChapterChange(chapter.id)}
                    disabled={isLocked}
                    type="button"
                  >
                    <span className="toc-number">{chapter.number}</span>
                    <div className="toc-info">
                      <span className="toc-title">{chapter.title}</span>
                      <span className="toc-subtitle">{chapter.subtitle}</span>
                    </div>
                    {chapter.isFree && <span className="toc-badge free">Free</span>}
                    {isLocked && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="11"
                          width="18"
                          height="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                    {!isLocked && !chapter.isFree && (
                      <span className="toc-badge unlocked">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {!access.canReadFullBook && (
              <div className="reader-toc-cta">
                <p>Unlock the full story</p>
                <Link href="/community" className="btn-primary">
                  Become a Supporter
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="reader-content">
        <div className="reader-chapter-header">
          <span className="reader-chapter-label">
            Chapter {currentChapter.number}
          </span>
          <h1>{currentChapter.title}</h1>
          <p className="reader-chapter-subtitle">{currentChapter.subtitle}</p>

          {currentChapter.isFree && (
            <span className="reader-free-badge">Free preview</span>
          )}

          {!currentChapter.isFree && access.canReadFullBook && (
            <span className="reader-unlocked-badge">Full access</span>
          )}
        </div>

        <div className="reader-text">
          {currentChapter.content.map((block, index) => {
            if (block.type === "break") {
              return (
                <div key={`${block.text}-${index}`} className="reader-break">
                  <span>{block.text}</span>
                </div>
              );
            }

            return (
              <p key={`${block.text}-${index}`} className="reader-paragraph">
                {block.text}
              </p>
            );
          })}
        </div>

        <div className="reader-chapter-nav">
          {currentIndex > 0 && (
            <button
              className="reader-nav-btn prev"
              onClick={goToPrevChapter}
              type="button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <div>
                <span className="nav-label">Previous</span>
                <span className="nav-chapter">
                  {chapters[currentIndex - 1].title}
                </span>
              </div>
            </button>
          )}

          {currentIndex < chapters.length - 1 && (
            <button
              className={`reader-nav-btn next ${
                !chapters[currentIndex + 1].isFree && !access.canReadFullBook
                  ? "locked"
                  : ""
              }`}
              onClick={goToNextChapter}
              disabled={
                !chapters[currentIndex + 1].isFree && !access.canReadFullBook
              }
              type="button"
            >
              <div>
                <span className="nav-label">
                  {!chapters[currentIndex + 1].isFree && !access.canReadFullBook
                    ? "Locked"
                    : "Next"}
                </span>
                <span className="nav-chapter">
                  {chapters[currentIndex + 1].title}
                </span>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {currentChapter.isFree && !access.canReadFullBook && (
          <div className="reader-lock-message">
            <div className="lock-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3>Chapter Two continues the story</h3>
            <p>
              Elias descends into the Underground. The city reveals its hidden layers.
              The light that sent him is only the beginning.
            </p>
            <div className="lock-features">
              <span>→ Full eBook access</span>
              <span>→ Early chapter previews</span>
              <span>→ Behind-the-scenes notes</span>
            </div>
            <Link href={pricing.supporter.href} className="btn-primary btn-large">
              Unlock for {pricing.supporter.price}
            </Link>
            <p className="lock-note">
              Or start with the {pricing.ebook.price} eBook — own it forever.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
