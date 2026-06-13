export const readerProgressKey = "streetlight-reader-progress";
export const readerBookmarksKey = "streetlight-reader-bookmarks";

export type ReaderMode = "scroll" | "page";

export type ReaderProgress = {
  chapterSlug: string;
  chapterTitle: string;
  mode: ReaderMode;
  pageIndex: number;
  progressPercent: number;
  lastOpenedAt: string;
};

export function getProgressChapterSlug(chapterSlug: string) {
  const parts = chapterSlug.split(":");
  return parts[parts.length - 1] || chapterSlug;
}

export function readReaderProgress(): ReaderProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedProgress = window.localStorage.getItem(readerProgressKey);

  if (!savedProgress) {
    return null;
  }

  try {
    const progress = JSON.parse(savedProgress) as Partial<ReaderProgress>;

    if (
      typeof progress.chapterSlug !== "string" ||
      typeof progress.chapterTitle !== "string" ||
      typeof progress.progressPercent !== "number" ||
      typeof progress.lastOpenedAt !== "string"
    ) {
      return null;
    }

    return {
      chapterSlug: progress.chapterSlug,
      chapterTitle: progress.chapterTitle,
      mode: progress.mode === "page" ? "page" : "scroll",
      pageIndex:
        typeof progress.pageIndex === "number" ? progress.pageIndex : 0,
      progressPercent: Math.min(100, Math.max(0, progress.progressPercent)),
      lastOpenedAt: progress.lastOpenedAt,
    };
  } catch {
    window.localStorage.removeItem(readerProgressKey);
    return null;
  }
}

export function readReaderBookmarks() {
  if (typeof window === "undefined") {
    return [];
  }

  const savedBookmarks = window.localStorage.getItem(readerBookmarksKey);

  if (!savedBookmarks) {
    return [];
  }

  try {
    const bookmarks = JSON.parse(savedBookmarks);

    return Array.isArray(bookmarks)
      ? bookmarks.filter(
          (bookmark): bookmark is string => typeof bookmark === "string",
        )
      : [];
  } catch {
    window.localStorage.removeItem(readerBookmarksKey);
    return [];
  }
}

export function writeReaderProgress(progress: ReaderProgress) {
  window.localStorage.setItem(readerProgressKey, JSON.stringify(progress));
}
