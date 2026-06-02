import { notFound } from "next/navigation";
import ReaderChapter from "@/components/ReaderChapter";
import { chapters, getChapter } from "@/lib/chapters";

type ChapterPageProps = {
  params: Promise<{
    chapter: string;
  }>;
};

export function generateStaticParams() {
  return chapters.map((chapter) => ({
    chapter: chapter.slug,
  }));
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapter: slug } = await params;
  const chapter = getChapter(slug);

  if (!chapter) {
    notFound();
  }

  return <ReaderChapter chapter={chapter} />;
}
