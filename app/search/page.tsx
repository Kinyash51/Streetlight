import { SearchPage, type SearchChapter } from "@/components/Search";
import { getSearchChapters } from "@/lib/book-chapters";

function buildSearchChapters(): SearchChapter[] {
  return getSearchChapters();
}

export default function Page() {
  return <SearchPage chapters={buildSearchChapters()} />;
}
