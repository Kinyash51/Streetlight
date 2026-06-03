import { createSupabaseServerClient } from "@/lib/supabase";
import { getReaderAccess } from "@/lib/access-control";
import ReaderChapter from "@/components/ReaderChapter";

import { getReaderChapters } from "@/lib/book-chapters";

export default async function BookPage({
  searchParams,
}: {
  searchParams?: Promise<{ chapter?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  const access = await getReaderAccess(user?.id || null);
  const readerChapters = getReaderChapters();

  // Get requested chapter or default to chapter one
  const requestedChapter = params.chapter || "chapter-one";
  const currentChapter =
    readerChapters.find((chapter) => chapter.slug === requestedChapter) ||
    readerChapters[0];

  return (
    <div className="book-page">
      <ReaderChapter
        chapter={currentChapter}
        chapters={readerChapters}
        access={{
          canReadChapterOne: access.canReadChapterOne,
          canReadFullBook: access.canReadFullBook,
          canReadEarlyChapters: access.canReadEarlyChapters,
          canAccessSupporterNotes: access.canAccessSupporterNotes,
          canAccessPatronExtras: access.canAccessPatronExtras,
        }}
        userId={user?.id || null}
        basePath="/book"
      />
    </div>
  );
}
