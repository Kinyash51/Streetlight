"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Link from "next/link";
import type { ClientAccess } from "@/lib/access-control";
import {
  readLocalHighlights,
  writeLocalHighlights,
  type LocalHighlight,
} from "@/lib/local-highlights";
import ShareButtons from "./ShareButtons";
import { BetaChapterReview, ParagraphFeedback } from "./BetaFeedback";
import {
  readerBookmarksKey,
  readReaderBookmarks,
  writeReaderProgress,
  type ReaderMode,
  type ReaderProgress,
} from "@/lib/reader-progress";
import {
  useReaderSettings,
  type ReaderTheme,
} from "@/src/hooks/useReaderSettings";

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

type HighlightBarPosition = {
  left: number;
  top: number;
};

function estimateReadTime(chapter: ReaderChapterData) {
  const wordCount = [chapter.intro, ...chapter.paragraphs].join(" ").split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 210));

  return `${minutes} min read`;
}

function readBookmarks() {
  return readReaderBookmarks();
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
  const { settings, updateSettings, isSyncing, isReady } =
    useReaderSettings(userId);
  const [pageIndex, setPageIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(25);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<
    number | null
  >(null);
  const [highlightBarPosition, setHighlightBarPosition] =
    useState<HighlightBarPosition | null>(null);
  const [pulsingParagraphIndex, setPulsingParagraphIndex] = useState<
    number | null
  >(null);
  const [highlightSaved, setHighlightSaved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [chapterReaction, setChapterReaction] = useState("");
  const manuscriptRef = useRef<HTMLElement>(null);
  const touchSelectionTimer = useRef<number | null>(null);
  const { fontSize, lineHeight, mode, theme, wide } = settings;
  const readTime = useMemo(() => estimateReadTime(chapter), [chapter]);
  const canReadFullBook = access?.canReadFullBook ?? false;
  const betaApplicationId = access?.betaApplicationId ?? null;
  const canLeaveBetaFeedback = Boolean(
    access?.isBetaReader && betaApplicationId && userId,
  );
  const canReadCurrentChapter = chapter.isFree !== false || canReadFullBook;
  const currentChapterIndex = chapters.findIndex((item) => item.slug === chapter.slug);
  const nextChapter =
    currentChapterIndex >= 0 ? chapters[currentChapterIndex + 1] ?? null : null;
  const previousChapter =
    currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] ?? null : null;
  const chapterLabel = chapter.number ? `Chapter ${chapter.number}` : chapter.title;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const match = window.location.hash.match(/^#p-(\d+)$/);

    if (!match) {
      return;
    }

    const targetIndex = Number.parseInt(match[1], 10);
    let pulseTimer: number | undefined;
    let scrollTimer: number | undefined;

    const modeTimer = window.setTimeout(() => {
      updateSettings({ mode: "scroll" });

      scrollTimer = window.setTimeout(() => {
        const targetElement = document.getElementById(`p-${targetIndex}`);

        if (!targetElement) {
          return;
        }

        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setPulsingParagraphIndex(targetIndex);
        pulseTimer = window.setTimeout(
          () => setPulsingParagraphIndex(null),
          4000,
        );
      }, 180);
    }, 0);

    return () => {
      window.clearTimeout(modeTimer);

      if (scrollTimer !== undefined) {
        window.clearTimeout(scrollTimer);
      }

      if (pulseTimer !== undefined) {
        window.clearTimeout(pulseTimer);
      }
    };
  }, [chapter.slug, isReady, updateSettings]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBookmarked(readBookmarks().includes(chapter.slug));
      setChapterReaction(
        window.localStorage.getItem(`streetlight-reaction-${chapter.slug}`) ?? "",
      );
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

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    function closeSettings(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSettingsOpen(false);
      }
    }

    document.body.classList.add("reader-sheet-open");
    window.addEventListener("keydown", closeSettings);

    return () => {
      document.body.classList.remove("reader-sheet-open");
      window.removeEventListener("keydown", closeSettings);
    };
  }, [settingsOpen]);

  useEffect(() => {
    document.body.classList.toggle("reader-focus-mode", !controlsVisible);

    return () => document.body.classList.remove("reader-focus-mode");
  }, [controlsVisible]);

  useEffect(
    () => () => {
      if (touchSelectionTimer.current !== null) {
        window.clearTimeout(touchSelectionTimer.current);
      }
    },
    [],
  );

  function updatePageIndex(nextPageIndex: number) {
    setPageIndex(nextPageIndex);
    saveProgress(
      Math.round(((nextPageIndex + 1) / pages.length) * 100),
      nextPageIndex,
      "page"
    );
  }

  function decreaseFont() {
    updateSettings({ fontSize: Math.max(14, fontSize - 1) });
  }

  function increaseFont() {
    updateSettings({ fontSize: Math.min(20, fontSize + 1) });
  }

  function captureSelection() {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";
    const manuscript = manuscriptRef.current;
    const anchorElement =
      selection?.anchorNode instanceof Element
        ? selection.anchorNode
        : selection?.anchorNode?.parentElement;
    const focusElement =
      selection?.focusNode instanceof Element
        ? selection.focusNode
        : selection?.focusNode?.parentElement;
    const paragraphElement =
      anchorElement?.closest<HTMLElement>("[data-paragraph-index]");
    const paragraphIndex = Number.parseInt(
      paragraphElement?.dataset.paragraphIndex ?? "",
      10,
    );
    const selectionRange =
      selection &&
      !selection.isCollapsed &&
      selection.rangeCount > 0
        ? selection.getRangeAt(0)
        : null;
    const selectionRects = selectionRange
      ? Array.from(selectionRange.getClientRects())
      : [];
    const selectionRect = selectionRects.at(-1);

    setHighlightSaved(false);

    if (
      text.length < 3 ||
      !selectionRect ||
      !manuscript ||
      !selection?.anchorNode ||
      !selection.focusNode ||
      !manuscript.contains(selection.anchorNode) ||
      !manuscript.contains(selection.focusNode) ||
      !anchorElement ||
      !focusElement
    ) {
      setSelectedText("");
      setSelectedParagraphIndex(null);
      setHighlightBarPosition(null);
      return;
    }

    setSelectedText(text.slice(0, 600));
    setSelectedParagraphIndex(
      Number.isNaN(paragraphIndex) ? null : paragraphIndex,
    );
    setHighlightBarPosition(
      selectionRect
        ? {
            left: Math.min(
              window.scrollX + window.innerWidth - 24,
              Math.max(
                window.scrollX + 24,
                selectionRect.left +
                  window.scrollX +
                  selectionRect.width / 2,
              ),
            ),
            top: selectionRect.top + window.scrollY,
          }
        : null,
    );
  }

  function beginTouchSelection() {
    if (touchSelectionTimer.current !== null) {
      window.clearTimeout(touchSelectionTimer.current);
    }

    touchSelectionTimer.current = window.setTimeout(captureSelection, 250);
  }

  function finishTouchSelection() {
    if (touchSelectionTimer.current !== null) {
      window.clearTimeout(touchSelectionTimer.current);
    }

    touchSelectionTimer.current = window.setTimeout(captureSelection, 100);
  }

  function saveHighlight() {
    if (!selectedText) {
      return;
    }

    const nextHighlight: LocalHighlight = {
      id: crypto.randomUUID(),
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
      ...(selectedParagraphIndex !== null
        ? { paragraphIndex: selectedParagraphIndex }
        : {}),
      text: selectedText,
      createdAt: new Date().toISOString(),
    };
    const highlights = readLocalHighlights();

    writeLocalHighlights([nextHighlight, ...highlights].slice(0, 50));
    window.getSelection()?.removeAllRanges();
    setSelectedText("");
    setSelectedParagraphIndex(null);
    setHighlightSaved(true);
    setToastMessage("Highlight saved locally.");
    window.setTimeout(() => {
      setHighlightSaved(false);
      setHighlightBarPosition(null);
    }, 2200);
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

  function toggleReaderChrome(event: MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;

    if (
      target.closest("button, a, textarea, input, label") ||
      window.getSelection()?.toString().trim()
    ) {
      return;
    }

    setControlsVisible((visible) => !visible);
  }

  function saveChapterReaction(reaction: string) {
    setChapterReaction(reaction);
    window.localStorage.setItem(`streetlight-reaction-${chapter.slug}`, reaction);
    setToastMessage("Reaction saved on this device.");
    window.setTimeout(() => setToastMessage(""), 2400);
  }

  return (
    <main
      className={`reader-page reader-viewport reader-theme-${theme} ${
        controlsVisible ? "" : "reader-controls-hidden"
      }`}
    >
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
        <p className="reader-settings-note" aria-live="polite">
          {isSyncing
            ? "Syncing reader settings..."
            : userId
              ? "Reader settings synced."
              : "Reader settings save on this device."}
        </p>
      </section>

      <section className="reader-toolbar" aria-label="Reader controls">
        <button
          type="button"
          className={bookmarked ? "reader-tool active" : "reader-tool"}
          onClick={toggleBookmark}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark chapter"}
          data-tooltip={bookmarked ? "Bookmarked" : "Bookmark"}
        >
          <svg
            className="reader-tool-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path
              d="M6.75 4.75A1.75 1.75 0 0 1 8.5 3h7A1.75 1.75 0 0 1 17.25 4.75V21L12 17.55 6.75 21V4.75Z"
              fill={bookmarked ? "currentColor" : "none"}
            />
          </svg>
        </button>

        <button
          type="button"
          className={settingsOpen ? "reader-settings-button active" : "reader-settings-button"}
          aria-expanded={settingsOpen}
          aria-controls="reader-settings-sheet"
          aria-label="Reading appearance"
          data-tooltip="Appearance"
          onClick={() => setSettingsOpen((value) => !value)}
        >
          <span className="reader-type-icon" aria-hidden="true">Aa</span>
        </button>

        {chapters.length > 1 && (
          <button
            type="button"
            className={mobileMenuOpen ? "reader-mobile-menu active" : "reader-mobile-menu"}
            aria-label={mobileMenuOpen ? "Close chapter list" : "Open chapter list"}
            aria-expanded={mobileMenuOpen}
            data-tooltip="Chapters"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <svg
              className="reader-tool-icon"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path d="M8.5 6.5h10M8.5 12h10M8.5 17.5h10" />
              <path d="M5 6.5h.01M5 12h.01M5 17.5h.01" />
            </svg>
          </button>
        )}
      </section>

      {settingsOpen ? (
        <div
          className="reader-sheet-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSettingsOpen(false);
            }
          }}
        >
          <section
            className="reader-settings-sheet"
            id="reader-settings-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-settings-title"
          >
            <div className="reader-sheet-handle" aria-hidden="true" />
            <header>
              <div>
                <p className="section-tag">Reading preferences</p>
                <h2 id="reader-settings-title">Make the page yours.</h2>
              </div>
              <button
                type="button"
                className="reader-sheet-close"
                onClick={() => setSettingsOpen(false)}
                aria-label="Close reading preferences"
              >
                Done
              </button>
            </header>

            <div className="reader-setting-row">
              <div>
                <strong>Text size</strong>
                <span>Adjust for comfortable reading.</span>
              </div>
              <div className="reader-control-group" aria-label="Font size">
                <button type="button" onClick={decreaseFont} aria-label="Decrease text size">
                  A-
                </button>
                <span>{fontSize}px</span>
                <button type="button" onClick={increaseFont} aria-label="Increase text size">
                  A+
                </button>
              </div>
            </div>

            <div className="reader-setting-row">
              <div>
                <strong>Reading mode</strong>
                <span>Continuous scroll or focused pages.</span>
              </div>
              <div className="reader-toggle" aria-label="Reading mode">
                <button
                  type="button"
                  className={mode === "scroll" ? "active" : ""}
                  onClick={() => {
                    updateSettings({ mode: "scroll" });
                    setPageIndex(0);
                  }}
                >
                  Scroll
                </button>
                <button
                  type="button"
                  className={mode === "page" ? "active" : ""}
                  onClick={() => updateSettings({ mode: "page" })}
                >
                  Page
                </button>
              </div>
            </div>

            <div className="reader-setting-row">
              <div>
                <strong>Page width</strong>
                <span>Focused for long sessions, wide for larger screens.</span>
              </div>
              <button
                type="button"
                className={wide ? "reader-sheet-option active" : "reader-sheet-option"}
                onClick={() => updateSettings({ wide: !wide })}
              >
                {wide ? "Wide" : "Focused"}
              </button>
            </div>

            <div className="reader-setting-row">
              <div>
                <strong>Line spacing</strong>
                <span>Give each line more or less breathing room.</span>
              </div>
              <div className="reader-control-group" aria-label="Line spacing">
                <button
                  type="button"
                  onClick={() =>
                    updateSettings({
                      lineHeight: Math.max(
                        1.6,
                        Number((lineHeight - .1).toFixed(1)),
                      ),
                    })
                  }
                  aria-label="Decrease line spacing"
                >
                  -
                </button>
                <span>{lineHeight.toFixed(1)}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateSettings({
                      lineHeight: Math.min(
                        2.2,
                        Number((lineHeight + .1).toFixed(1)),
                      ),
                    })
                  }
                  aria-label="Increase line spacing"
                >
                  +
                </button>
              </div>
            </div>

            <div className="reader-theme-options" aria-label="Reader theme">
              {(["dark", "amber", "paper"] as ReaderTheme[]).map((option) => (
                <button
                  type="button"
                  className={theme === option ? `active ${option}` : option}
                  aria-pressed={theme === option}
                  key={option}
                  onClick={() => updateSettings({ theme: option })}
                >
                  <span aria-hidden="true">Aa</span>
                  {option}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

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
          ref={manuscriptRef}
          className={`reader-manuscript ${wide ? "wide" : ""} ${
            mode === "page" ? "paged" : ""
          }`}
          style={{
            fontSize: `${fontSize}px`,
            "--reader-line-height": lineHeight,
          } as React.CSSProperties}
          onMouseUp={captureSelection}
          onTouchStart={beginTouchSelection}
          onTouchEnd={finishTouchSelection}
          onClick={toggleReaderChrome}
        >
          <p className="reader-kicker">{chapter.eyebrow}</p>

          {mode === "scroll" ? (
            <>
              <div
                className={`reader-paragraph-block prose-paragraph-block ${
                  selectedParagraphIndex === 0 ? "has-feedback-focus" : ""
                }`}
              >
                <p
                  id="p-0"
                  data-paragraph-index={0}
                  className={`reader-intro ${
                    pulsingParagraphIndex === 0
                      ? "pulse-highlight-target"
                      : ""
                  }`}
                >
                  {chapter.intro}
                </p>
                {canLeaveBetaFeedback && betaApplicationId && userId ? (
                  <ParagraphFeedback
                    applicationId={betaApplicationId}
                    userId={userId}
                    chapterSlug={chapter.slug}
                    paragraphIndex={0}
                    selectedText={chapter.intro}
                  />
                ) : null}
              </div>
              {chapter.paragraphs.map((paragraph, index) => (
                <div
                  className={`reader-paragraph-block prose-paragraph-block ${
                    selectedParagraphIndex === index + 1
                      ? "has-feedback-focus"
                      : ""
                  }`}
                  key={`${index}-${paragraph}`}
                >
                  <p
                    id={`p-${index + 1}`}
                    data-paragraph-index={index + 1}
                    className={
                      pulsingParagraphIndex === index + 1
                        ? "pulse-highlight-target"
                        : ""
                    }
                  >
                    {paragraph}
                  </p>
                  {canLeaveBetaFeedback && betaApplicationId && userId ? (
                    <ParagraphFeedback
                      applicationId={betaApplicationId}
                      userId={userId}
                      chapterSlug={chapter.slug}
                      paragraphIndex={index + 1}
                      selectedText={paragraph}
                    />
                  ) : null}
                </div>
              ))}
            </>
          ) : (
            <>
              {currentPage.map((paragraph, index) => {
                const paragraphIndex =
                  pageIndex === 0 ? index : index + 3;
                const pulsing = pulsingParagraphIndex === paragraphIndex;

                return pageIndex === 0 && index === 0 ? (
                  <p
                    id={`p-${paragraphIndex}`}
                    data-paragraph-index={paragraphIndex}
                    className={`reader-intro ${
                      pulsing ? "pulse-highlight-target" : ""
                    }`}
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                ) : (
                  <p
                    id={`p-${paragraphIndex}`}
                    data-paragraph-index={paragraphIndex}
                    className={pulsing ? "pulse-highlight-target" : ""}
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                );
              })}
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
            Chapter One stays free. Apply for the private beta program to read
            the available draft and leave feedback while payments are offline.
          </p>
          <div className="lock-features">
            <span>Available draft chapters</span>
            <span>Private paragraph notes</span>
            <span>Chapter reviews</span>
          </div>
          <div className="reader-lock-actions">
            <Link href="/beta" className="btn-primary">
              Apply for Beta Access
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
        <section
          className="highlight-save-bar selection-action-bubble"
          aria-live="polite"
          style={
            highlightBarPosition
              ? {
                  left: `${highlightBarPosition.left}px`,
                  top: `${highlightBarPosition.top}px`,
                }
              : undefined
          }
        >
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

      {!controlsVisible ? (
        <button
          type="button"
          className="reader-show-controls"
          onClick={() => setControlsVisible(true)}
        >
          Show controls
        </button>
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
                ? "Apply for the private beta program to continue through the available draft and help shape the story."
                : "The next part of the city is ready when you are."
              : "More Streetlight pages will appear here as the book grows."}
          </p>
          <div className="reader-reactions" aria-label="React to this chapter">
            <span>How did it feel?</span>
            <div>
              {[
                ["hooked", "Hooked"],
                ["haunted", "Haunted"],
                ["curious", "Curious"],
                ["heavy", "Heavy"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  className={chapterReaction === value ? "active" : ""}
                  aria-pressed={chapterReaction === value}
                  key={value}
                  onClick={() => saveChapterReaction(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="reader-endcap-primary">
            {nextChapter && (nextChapter.isFree !== false || canReadFullBook) ? (
              <Link href={getChapterHref(basePath, nextChapter.slug)} className="btn-primary">
                Read {nextChapter.title}
              </Link>
            ) : nextChapter ? (
              <>
                <Link href="/beta" className="btn-primary">
                  Apply for Beta Access
                </Link>
                <Link href="/community" className="btn-ghost">
                  Explore the Community
                </Link>
              </>
            ) : (
              <Link href="/book" className="btn-primary">
                Return to the book
              </Link>
            )}
          </div>
          <details className="reader-endcap-more">
            <summary>More chapter actions</summary>
            <div className="reader-endcap-secondary">
              {previousChapter ? (
                <Link href={getChapterHref(basePath, previousChapter.slug)}>
                  Previous chapter
                </Link>
              ) : null}
              <Link href="/book">Book overview</Link>
              <Link href="/highlights">Saved highlights</Link>
            </div>
            <ShareButtons
              title={`Streetlight - ${chapter.title}`}
              text={`Read ${chapter.title} from The Drowned Streetlamp.`}
              path={getChapterHref(basePath, chapter.slug)}
            />
          </details>
        </section>
      )}

      {canLeaveBetaFeedback && betaApplicationId && userId ? (
        <BetaChapterReview
          applicationId={betaApplicationId}
          userId={userId}
          chapterSlug={chapter.slug}
        />
      ) : null}
    </main>
  );
}
