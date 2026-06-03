import { redirect } from "next/navigation";
import { ReaderClient } from "@/components/reader-client";
import { getReaderAccess } from "@/lib/access-control";
import { createSupabaseServerClient } from "@/lib/supabase";

type ChapterBlock = {
  type: "paragraph" | "break";
  text: string;
};

type Chapter = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  isFree: boolean;
  wordCount: number;
  content: ChapterBlock[];
};

const chapters: Chapter[] = [
  {
    id: "chapter-one",
    number: 1,
    title: "The Drowned Streetlamp",
    subtitle: "Where the rain began",
    isFree: true,
    wordCount: 4200,
    content: [
      {
        type: "paragraph",
        text: "The rain had been falling for three days when Elias first saw the drowned streetlamp. It stood at the corner of Meridian and Hollow, its light burning beneath three inches of standing water, as if the city itself had forgotten which way was up.",
      },
      {
        type: "paragraph",
        text: "Elias knew that corner. He knew which doorways stayed dry, which alleys to avoid, and which streetlamps flickered before they died. But he had never seen one burn underwater.",
      },
      {
        type: "paragraph",
        text: "The city had taught him not to be curious. Curiosity led to questions, questions led to attention, and attention was the one thing you did not want in a place that remembered everyone it broke.",
      },
      {
        type: "paragraph",
        text: "But the streetlamp kept burning.",
      },
      {
        type: "paragraph",
        text: "He stepped out from the pharmacy doorway, felt the rain hit his shoulders like small, cold fingers, and walked toward the light. The water came over his shoes, cheap canvas already soaked through.",
      },
      {
        type: "paragraph",
        text: '"You see it too," a voice said.',
      },
      {
        type: "paragraph",
        text: "Elias turned. An old woman sat on the steps of a boarded-up brownstone, wrapped in layers of plastic and wool, her face hidden in shadow except for the amber catch of the streetlamp in her eyes.",
      },
      {
        type: "paragraph",
        text: '"See what?" he asked.',
      },
      {
        type: "paragraph",
        text: '"The light that should not be." She smiled, or he thought she did. "The city is showing you something. The question is whether you will look long enough to understand what."',
      },
      {
        type: "paragraph",
        text: "Elias looked back at the streetlamp. The water had risen another inch while they spoke, and still the light burned.",
      },
      {
        type: "paragraph",
        text: '"Who are you?" he asked.',
      },
      {
        type: "paragraph",
        text: '"Someone who looked too long," she said. "And now I cannot stop seeing."',
      },
      {
        type: "paragraph",
        text: "She stood, joints cracking like dry twigs, and walked past him into the rain. He watched her go, a small figure swallowed by the dark, and then he looked back at the streetlamp one more time.",
      },
      {
        type: "paragraph",
        text: "The light flickered.",
      },
      {
        type: "paragraph",
        text: "Not the flicker of a dying bulb. This was different. This was a pulse, like a heartbeat, like the city was breathing.",
      },
      {
        type: "paragraph",
        text: "Elias stepped into the puddle.",
      },
      {
        type: "paragraph",
        text: "The water was warm.",
      },
      {
        type: "paragraph",
        text: "That was the first thing he noticed, before the light, before the sound, before the vertigo that tilted the world and showed him what lay beneath the streets.",
      },
      {
        type: "paragraph",
        text: '"Do not touch it," the old woman said from somewhere far away. "Not until you are ready to be seen."',
      },
      {
        type: "paragraph",
        text: "Elias touched the water.",
      },
      {
        type: "paragraph",
        text: "And the city looked back.",
      },
      {
        type: "break",
        text: "*",
      },
    ],
  },
  {
    id: "chapter-two",
    number: 2,
    title: "The Underground Map",
    subtitle: "The city beneath the city",
    isFree: false,
    wordCount: 5100,
    content: [
      {
        type: "paragraph",
        text: "The first rule of the Underground was that it did not stay in one place. Elias learned that before he learned how to breathe under the city.",
      },
      {
        type: "paragraph",
        text: "The tunnel beneath Meridian looked older than the street above it, older than the buildings, older than the names on the rusted signs.",
      },
      {
        type: "paragraph",
        text: "Every wall was covered in marks: arrows, names, warnings, dates, and sketches of lamps burning in impossible places.",
      },
      {
        type: "paragraph",
        text: '"If the city shows you a door," the old woman had said, "it is because someone else is already waiting on the other side."',
      },
      {
        type: "paragraph",
        text: "Elias kept walking because the water behind him had begun to rise again.",
      },
    ],
  },
  {
    id: "chapter-three",
    number: 3,
    title: "Names in the Rain",
    subtitle: "What the streets remember",
    isFree: false,
    wordCount: 4800,
    content: [
      {
        type: "paragraph",
        text: "By morning, the city had forgotten the storm. The sidewalks steamed. The gutters whispered. The drowned streetlamp stood dry and dead at the corner like an ordinary thing.",
      },
      {
        type: "paragraph",
        text: "But Elias remembered what had opened beneath it, and memory was the one currency the city never wasted.",
      },
      {
        type: "paragraph",
        text: "Someone had written his name on the pharmacy glass while he was gone.",
      },
      {
        type: "paragraph",
        text: "Not in paint. Not in dust. In rainwater, running upward.",
      },
    ],
  },
];

type BookPageProps = {
  searchParams?: Promise<{
    chapter?: string;
  }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = searchParams ? await searchParams : {};
  const requestedChapter = params.chapter || "chapter-one";
  const currentChapter = chapters.find((chapter) => chapter.id === requestedChapter) ?? chapters[0];

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = await getReaderAccess(user?.id);

  if (!currentChapter.isFree && !access.canReadFullBook) {
    redirect("/community");
  }

  return (
    <main className="book-page reader-book-page">
      <ReaderClient
        chapters={chapters}
        currentChapterId={currentChapter.id}
        access={{
          canReadChapterOne: access.canReadChapterOne,
          canReadFullBook: access.canReadFullBook,
          canReadEarlyChapters: access.canReadEarlyChapters,
          canAccessSupporterNotes: access.canAccessSupporterNotes,
          canAccessPatronExtras: access.canAccessPatronExtras,
        }}
        userId={user?.id ?? null}
      />
    </main>
  );
}
