import { SearchPage, type SearchChapter } from "@/components/Search";
import { chapters } from "@/lib/chapters";

function buildSearchChapters(): SearchChapter[] {
  return chapters.map((chapter) => ({
    slug: chapter.slug,
    title: chapter.title,
    book: chapter.book,
    content: [chapter.eyebrow, chapter.intro, ...chapter.paragraphs].join("\n\n"),
  }));
}

export default function Page() {
  return <SearchPage chapters={buildSearchChapters()} />;
}
