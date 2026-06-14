export type LocalHighlight = {
  id: string;
  chapterSlug: string;
  chapterTitle: string;
  paragraphIndex?: number;
  text: string;
  createdAt: string;
};

export const localHighlightsKey = "streetlight-reader-highlights";

export function readLocalHighlights() {
  const savedHighlights = window.localStorage.getItem(localHighlightsKey);

  if (!savedHighlights) {
    return [];
  }

  try {
    const parsedHighlights = JSON.parse(savedHighlights) as Partial<LocalHighlight>[];

    if (!Array.isArray(parsedHighlights)) {
      return [];
    }

    return parsedHighlights
      .filter(
        (highlight): highlight is LocalHighlight =>
          typeof highlight.id === "string" &&
          typeof highlight.chapterSlug === "string" &&
          typeof highlight.chapterTitle === "string" &&
          (highlight.paragraphIndex === undefined ||
            (typeof highlight.paragraphIndex === "number" &&
              Number.isInteger(highlight.paragraphIndex) &&
              highlight.paragraphIndex >= 0)) &&
          typeof highlight.text === "string" &&
          typeof highlight.createdAt === "string"
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch {
    window.localStorage.removeItem(localHighlightsKey);
    return [];
  }
}

export function writeLocalHighlights(highlights: LocalHighlight[]) {
  window.localStorage.setItem(localHighlightsKey, JSON.stringify(highlights));
}
