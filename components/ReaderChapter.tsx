"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ClientAccess } from "@/lib/access-control";
import {
  readLocalHighlights,
  writeLocalHighlights,
  type LocalHighlight,
} from "@/lib/local-highlights";
import ShareButtons from "./ShareButtons";

type ReaderMode = "scroll" | "page";
type ReaderTheme = "dark" | "amber" | "paper";

type ReaderChapterData = {
  slug: string;
  book: string;
  title: string;
  eyebrow: string;
  intro: string;
  paragraphs: string[];
  nextSlug: string | null;
  number?: number;
  subtitle?: string;
  isFree?: boolean;
  wordCount?: number;
};

type ReaderChapterProps = {
  chapter: ReaderChapterData;
  chapters?: ReaderChapterData[];
  access?: ClientAccess;
  userId?: string | null;
  basePath?: "/read" | "/book";
};

const readerSettingsKey = "streetlight-reader-settings";
const readerProgressKey = "streetlight-reader-progress";
const readerBookmarksKey = "streetlight-reader-bookmarks";

const defaultReaderSettings: ReaderSettings = {
  mode: "scroll",
  theme: "dark",
  fontScale: 1,
  wide: false,
};

type ReaderSettings = {
  mode: ReaderMode;
  theme: ReaderTheme;
  fontScale: number;
  wide: boolean;
};

type ReaderProgress = {
  chapterSlug: string;
  chapterTitle: string;
  mode: ReaderMode;
  pageIndex: number;
  progressPercent: number;
  lastOpenedAt: string;
};

function estimateReadTime(chapter: ReaderChapterData) {
  const wordCount = [chapter.intro, ...chapter.paragraphs].join(" ").split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 210));

  return `${minutes} min read`;
}

function writeReaderProgress(progressSnapshot: ReaderProgress) {
  window.localStorage.setItem(readerProgressKey, JSON.stringify(progressSnapshot));
}

function readBookmarks() {
  const savedBookmarks = window.localStorage.getItem(readerBookmarksKey);

  if (!savedBookmarks) {
    return [];
  }

  try {
    const parsedBookmarks = JSON.parse(savedBookmarks);

    return Array.isArray(parsedBookmarks)
      ? parsedBookmarks.filter((bookmark): bookmark is string => typeof bookmark === "string")
      : [];
  } catch {
    window.localStorage.removeItem(readerBookmarksKey);
    return [];
  }
}

function isReaderMode(value: unknown): value is ReaderMode {
  return value === "scroll" || value === "page";
}

function isReaderTheme(value: unknown): value is ReaderTheme {
  return value === "dark" || value === "amber" || value === "paper";
}

function readSavedReaderSettings(): ReaderSettings {
  if (typeof window === "undefined") {
    return defaultReaderSettings;
  }

  const savedSettings = window.localStorage.getItem(readerSettingsKey);

  if (!savedSettings) {
    return defaultReaderSettings;
  }

  try {
    const parsedSettings = JSON.parse(savedSettings) as Partial<ReaderSettings>;

    return {
      mode: isReaderMode(parsedSettings.mode)
        ? parsedSettings.mode
        : defaultReaderSettings.mode,
      theme: isReaderTheme(parsedSettings.theme)
        ? parsedSettings.theme
        : defaultReaderSettings.theme,
      fontScale:
        typeof parsedSettings.fontScale === "number"
          ? Math.min(1.25, Math.max(0.9, parsedSettings.fontScale))
          : defaultReaderSettings.fontScale,
      wide:
        typeof parsedSettings.wide === "boolean"
          ? parsedSettings.wide
          : defaultReaderSettings.wide,
    };
  } catch {
    window.localStorage.removeItem(readerSettingsKey);
    return defaultReaderSettings;
  }
}

function getChapterHref(basePath: "/read" | "/book", slug: string) {
  return basePath === "/book" ? `/book?chapter=${slug}` : `/read/${slug}`;
}

export default function ReaderChapter({
  chapter,
  chapters = [chapter],
  access,
  userId,
  basePath = "/read",
}: ReaderChapterProps) {
  const [settings, setSettings] = useState<ReaderSettings>(defaultReaderSettings);
  const [pageIndex, setPageIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(25);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [highlightSaved, setHighlightSaved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { fontScale, mode, theme, wide } = settings;
  const readTime = useMemo(() => estimateReadTime(chapter), [chapter]);
  const canReadFullBook = access?.canReadFullBook ?? false;
  const canReadCurrentChapter = chapter.isFree !== false || canReadFullBook;
  const currentChapterIndex = chapters.findIndex((item) => item.slug === chapter.slug);
  const nextChapter =
    currentChapterIndex >= 0 ? chapters[currentChapterIndex + 1] ?? null : null;
  const previousChapter =
    currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] ?? null : null;
  const chapterLabel = chapter.number ? `Chapter ${chapter.number}` : chapter.title;

  useEffect(() => {
    const savedSettings = readSavedReaderSettings();
    window.setTimeout(() => setSettings(savedSettings), 0);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBookmarked(readBookmarks().includes(chapter.slug));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [chapter.slug]);

  const pages = useMemo(
    () => [
      [chapter.intro, ...chapter.paragraphs.slice(0, 2)],
      chapter.paragraphs.slice(2),
    ],
    [chapter]
  );
  const currentPage = pages[pageIndex] ?? pages[0];
  const progress =
    mode === "page"
      ? Math.round(((pageIndex + 1) / pages.length) * 100)
      : scrollProgress;
  const timeLeft = useMemo(() => {
    const minutes = Math.max(
      1,
      Math.ceil(((100 - progress) / 100) * Number.parseInt(readTime, 10))
    );

    return progress >= 92 ? "Almost done" : `${minutes} min left`;
  }, [progress, readTime]);

  function saveSettings(nextSettings: ReaderSettings) {
    setSettings(nextSettings);
    window.localStorage.setItem(readerSettingsKey, JSON.stringify(nextSettings));
  }

  const saveProgress = useCallback((
    progressPercent: number,
    nextPageIndex: number,
    nextMode: ReaderMode
  ) => {
    const progressSnapshot: ReaderProgress = {
      chapterSlug: userId ? `${userId}:${chapter.slug}` : chapter.slug,
      chapterTitle: chapter.title,
      mode: nextMode,
      pageIndex: nextPageIndex,
      progressPercent,
      lastOpenedAt: new Date().toISOString(),
    };

    writeReaderProgress(progressSnapshot);
  }, [chapter.slug, chapter.title, userId]);

  useEffect(() => {
    saveProgress(progress, pageIndex, mode);
  }, [mode, pageIndex, progress, saveProgress]);

  useEffect(() => {
    if (mode !== "scroll") {
      return;
    }

    function updateScrollProgress() {
      const manuscript = document.querySelector(".reader-manuscript");

      if (!manuscript) {
        return;
      }

      const rect = manuscript.getBoundingClientRect();
      const readableDistance = rect.height + window.innerHeight;
      const readDistance = window.innerHeight - rect.top;
      const percent = Math.min(
        100,
        Math.max(5, Math.round((readDistance / readableDistance) * 100))
      );

      setScrollProgress(percent);
      saveProgress(percent, 0, "scroll");
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    const timer = window.setTimeout(updateScrollProgress, 0);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.clearTimeout(timer);
    };
  }, [mode, saveProgress]);

  function updatePageIndex(nextPageIndex: number) {
    setPageIndex(nextPageIndex);
    saveProgress(
      Math.round(((nextPageIndex + 1) / pages.length) * 100),
      nextPageIndex,
      "page"
    );
  }

  function decreaseFont() {
    saveSettings({
      ...settings,
      fontScale: Math.max(0.9, Number((fontScale - 0.05).toFixed(2))),
    });
  }

  function increaseFont() {
    saveSettings({
      ...settings,
      fontScale: Math.min(1.25, Number((fontScale + 0.05).toFixed(2))),
    });
  }

  function captureSelection() {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";

    setHighlightSaved(false);

    if (text.length < 3) {
      setSelectedText("");
      return;
    }

    setSelectedText(text.slice(0, 600));
  }

  function saveHighlight() {
    if (!selectedText) {
      return;
    }

    const nextHighlight: LocalHighlight = {
      id: `${Date.now()}`,
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
      text: selectedText,
      createdAt: new Date().toISOString(),
    };
    const highlights = readLocalHighlights();

    writeLocalHighlights([nextHighlight, ...highlights].slice(0, 50));
    window.getSelection()?.removeAllRanges();
    setSelectedText("");
    setHighlightSaved(true);
    setToastMessage("Highlight saved locally.");
    window.setTimeout(() => setToastMessage(""), 2400);
  }

  function toggleBookmark() {
    const bookmarks = readBookmarks();
    const nextBookmarks = bookmarked
      ? bookmarks.filter((bookmark) => bookmark !== chapter.slug)
      : [...new Set([chapter.slug, ...bookmarks])];

    window.localStorage.setItem(readerBookmarksKey, JSON.stringify(nextBookmarks));
    setBookmarked(!bookmarked);
    setToastMessage(bookmarked ? "Bookmark removed." : "Bookmark saved locally.");
    window.setTimeout(() => setToastMessage(""), 2400);
  }

  return (
    <main className={`reader-page reader-theme-${theme}`}>
      <section className="reader-chrome">
        <div>
          <Link href="/book" className="reader-back">
            Back to book
          </Link>
          <p className="section-tag">{chapter.book}</p>
          <h1>{chapter.title}</h1>
          <div className="reader-meta-bar">
            <span>{chapterLabel}</span>
            <span>{chapter.isFree === false ? "Locked chapter" : chapter.eyebrow}</span>
            <span>{readTime}</span>
            <span>{timeLeft}</span>
            <span>Saved locally</span>
          </div>
        </div>

        <div className="reader-progress" aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="reader-settings-note">
          Reader settings save on this device.
        </p>
      </section>

      <section className="reader-toolbar" aria-label="Reader controls">
        <button
          type="button"
          className={bookmarked ? "reader-tool active" : "reader-tool"}
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
        >
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>

        <div className="reader-toggle" aria-label="Reading mode">
          <button
            type="button"
            className={mode === "scroll" ? "active" : ""}
            onClick={() => {
              saveSettings({ ...settings, mode: "scroll" });
              setPageIndex(0);
            }}
          >
            Scroll
          </button>
          <button
            type="button"
            className={mode === "page" ? "active" : ""}
            onClick={() => saveSettings({ ...settings, mode: "page" })}
          >
            Page
          </button>
        </div>

        <button
          type="button"
          className={settingsOpen ? "reader-settings-button active" : "reader-settings-button"}
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((value) => !value)}
        >
          Settings
        </button>

        {chapters.length > 1 && (
          <button
            type="button"
            className={mobileMenuOpen ? "reader-mobile-menu active" : "reader-mobile-menu"}
            aria-label="Open chapters"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        <div className={settingsOpen ? "reader-settings open" : "reader-settings"}>
          <div className="reader-control-group" aria-label="Font size">
            <button type="button" onClick={decreaseFont}>
              A-
            </button>
            <span>{Math.round(fontScale * 100)}%</span>
            <button type="button" onClick={increaseFont}>
              A+
            </button>
          </div>

          <button
            type="button"
            className={wide ? "reader-tool active" : "reader-tool"}
            onClick={() => saveSettings({ ...settings, wide: !wide })}
          >
            {wide ? "Focused width" : "Wide width"}
          </button>

          <div className="reader-toggle" aria-label="Reader theme">
            <button
              type="button"
              className={theme === "dark" ? "active" : ""}
              onClick={() => saveSettings({ ...settings, theme: "dark" })}
            >
              Dark
            </button>
            <button
              type="button"
              className={theme === "amber" ? "active" : ""}
              onClick={() => saveSettings({ ...settings, theme: "amber" })}
            >
              Amber
            </button>
            <button
              type="button"
              className={theme === "paper" ? "active" : ""}
              onClick={() => saveSettings({ ...settings, theme: "paper" })}
            >
              Paper
            </button>
          </div>
        </div>
      </section>

      {mobileMenuOpen && chapters.length > 1 && (
        <section className="reader-mobile-dropdown" aria-label="Mobile chapters">
          {chapters.map((item) => {
            const locked = item.isFree === false && !canReadFullBook;
            const active = item.slug === chapter.slug;
            const label = item.number ? `Chapter ${item.number}` : item.title;

            return locked ? (
              <span
                className={active ? "reader-mobile-chapter active locked" : "reader-mobile-chapter locked"}
                key={item.slug}
              >
                <span>{label}</span>
                <strong>{item.title}</strong>
                <small>Locked</small>
              </span>
            ) : (
              <Link
                className={active ? "reader-mobile-chapter active" : "reader-mobile-chapter"}
                href={getChapterHref(basePath, item.slug)}
                key={item.slug}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{label}</span>
                <strong>{item.title}</strong>
                <small>{active ? "Reading" : item.isFree ? "Free" : "Unlocked"}</small>
              </Link>
            );
          })}
        </section>
      )}

      {chapters.length > 1 && (
        <section className="reader-toc-strip" aria-label="Book chapters">
          <div>
            <p className="section-tag">Contents</p>
            <h2>The Drowned Streetlamp</h2>
          </div>
          <div className="reader-toc-list">
            {chapters.map((item) => {
              const locked = item.isFree === false && !canReadFullBook;
              const active = item.slug === chapter.slug;

              return locked ? (
                <span
                  className={active ? "reader-toc-pill active locked" : "reader-toc-pill locked"}
                  key={item.slug}
                >
                  <span>{item.number ? `Chapter ${item.number}` : item.title}</span>
                  <small>Locked</small>
                </span>
              ) : (
                <Link
                  className={active ? "reader-toc-pill active" : "reader-toc-pill"}
                  href={getChapterHref(basePath, item.slug)}
                  key={item.slug}
                >
                  <span>{item.number ? `Chapter ${item.number}` : item.title}</span>
                  <small>{active ? "Reading" : item.isFree ? "Free" : "Unlocked"}</small>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {canReadCurrentChapter ? (
        <article
          className={`reader-manuscript ${wide ? "wide" : ""} ${
            mode === "page" ? "paged" : ""
          }`}
          style={{ fontSize: `${fontScale}rem` }}
          onMouseUp={captureSelection}
          onTouchEnd={captureSelection}
        >
          <p className="reader-kicker">{chapter.eyebrow}</p>

          {mode === "scroll" ? (
            <>
              <p className="reader-intro">{chapter.intro}</p>
              {chapter.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </>
          ) : (
            <>
              {currentPage.map((paragraph, index) =>
                pageIndex === 0 && index === 0 ? (
                  <p className="reader-intro" key={paragraph}>
                    {paragraph}
                  </p>
                ) : (
                  <p key={paragraph}>{paragraph}</p>
                )
              )}
              <div className="page-controls">
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={pageIndex === 0}
                  onClick={() => updatePageIndex(Math.max(0, pageIndex - 1))}
                >
                  Previous
                </button>
                <span>
                  Page {pageIndex + 1} of {pages.length}
                </span>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={pageIndex === pages.length - 1}
                  onClick={() =>
                    updatePageIndex(Math.min(pages.length - 1, pageIndex + 1))
                  }
                >
                  Next
                </button>
              </div>
            </>
          )}
        </article>
      ) : (
        <section className="reader-lock-message">
          <span className="lock-icon">Locked</span>
          <h2>{chapter.title} is waiting.</h2>
          <p>
            Chapter One stays free. Unlock the full eBook once, or support
            monthly to read every available chapter and future supporter drops.
          </p>
          <div className="lock-features">
            <span>Full eBook access</span>
            <span>Supporter chapters</span>
            <span>Reader progress</span>
          </div>
          <div className="reader-lock-actions">
            <Link href="/checkout" className="btn-primary">
              View eBook access
            </Link>
            <Link href="/community" className="btn-ghost">
              View memberships
            </Link>
          </div>
          <ShareButtons
            title="Streetlight - The Drowned Streetlamp"
            text="I found this rain-soaked noir story called Streetlight."
            path="/book"
          />
        </section>
      )}

      {(selectedText || highlightSaved) && (
        <section className="highlight-save-bar" aria-live="polite">
          {selectedText ? (
            <>
              <p>
                Save highlight: <span>{selectedText}</span>
              </p>
              <button type="button" className="btn-primary" onClick={saveHighlight}>
                Save Highlight
              </button>
            </>
          ) : (
            <>
              <p>Highlight saved locally.</p>
              <Link href="/highlights" className="btn-ghost">
                View Highlights
              </Link>
            </>
          )}
        </section>
      )}

      {toastMessage ? (
        <div className="reader-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}

      {canReadCurrentChapter && (
        <section className="reader-endcap">
          <p className="section-tag">
            {nextChapter ? "Next Chapter" : "End of Current Story"}
          </p>
          <h2>
            {nextChapter
              ? nextChapter.isFree === false && !canReadFullBook
                ? `${nextChapter.title} is locked.`
                : "Keep reading?"
              : "You reached the last available chapter."}
          </h2>
          <p>
            {nextChapter
              ? nextChapter.isFree === false && !canReadFullBook
                ? "Continue exploring the rain-soaked world of Streetlight by unlocking the full eBook or joining as a monthly supporter."
                : "The next part of the city is ready when you are."
              : "More Streetlight pages will appear here as the book grows."}
          </p>
          <div className="reader-lock-actions">
            {previousChapter && (
              <Link href={getChapterHref(basePath, previousChapter.slug)} className="btn-ghost">
                Previous chapter
              </Link>
            )}
            {nextChapter && (nextChapter.isFree !== false || canReadFullBook) ? (
              <Link href={getChapterHref(basePath, nextChapter.slug)} className="btn-primary">
                Read {nextChapter.title}
              </Link>
            ) : (
              <>
                <Link href="/checkout" className="btn-primary">
                  View eBook access
                </Link>
                <Link href="/community" className="btn-ghost">
                  Become a Supporter
                </Link>
              </>
            )}
          </div>
          <ShareButtons
            title={`Streetlight - ${chapter.title}`}
            text={`Read ${chapter.title} from The Drowned Streetlamp.`}
            path={getChapterHref(basePath, chapter.slug)}
          />
        </section>
      )}
    </main>
  );
}
