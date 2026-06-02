export type Chapter = {
  slug: string;
  book: string;
  title: string;
  eyebrow: string;
  intro: string;
  paragraphs: string[];
  nextSlug: string | null;
};

export const chapters: Chapter[] = [
  {
    slug: "chapter-one",
    book: "The Drowned Streetlamp",
    title: "Chapter One",
    eyebrow: "Free Preview",
    intro: "Rain always arrived before the memories.",
    paragraphs: [
      "The city never slept. It only dimmed itself long enough for people to believe morning was different from night.",
      "Under a flickering streetlamp, a boy stood alone, watching water crawl through the cracks of the pavement like veins.",
      "Nobody looked at him. Nobody ever did.",
      "He had learned long ago that being unseen was sometimes safer than being noticed.",
    ],
    nextSlug: null,
  },
];

export function getChapter(slug: string) {
  return chapters.find((chapter) => chapter.slug === slug);
}
