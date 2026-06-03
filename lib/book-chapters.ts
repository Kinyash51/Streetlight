export type BookChapterBlock = {
  type: "paragraph" | "break";
  text: string;
};

export type BookChapter = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  isFree: boolean;
  wordCount: number;
  content: BookChapterBlock[];
};

export type ReaderChapterData = {
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
export const bookChapters = [
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
        text: "Elias knew that corner. He knew which doorways stayed dry, which alleys to avoid, and which streetlamps flickered before they died. But he had never seen one burn underwater. He stood in the shelter of a burned-out pharmacy, watching the amber glow ripple through the puddle, and felt something he had not felt in years: curiosity.",
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
        text: "He stepped out from the pharmacy doorway, felt the rain hit his shoulders like small, cold fingers, and walked toward the light. The water came over his shoes — cheap canvas, already soaked through — and he stopped at the edge of the puddle, close enough to see his own reflection broken by the ripples.",
      },
      {
        type: "paragraph",
        text: "\"You see it too,\" a voice said.",
      },
      {
        type: "paragraph",
        text: "Elias turned. An old woman sat on the steps of a boarded-up brownstone, wrapped in layers of plastic and wool, her face hidden in shadow except for the amber catch of the streetlamp in her eyes.",
      },
      {
        type: "paragraph",
        text: "\"See what?\" he asked.",
      },
      {
        type: "paragraph",
        text: "\"The light that shouldn't be.\" She smiled, or he thought she did — it was hard to tell in the dark. \"The city is showing you something. The question is whether you'll look long enough to understand what.\"",
      },
      {
        type: "paragraph",
        text: "Elias looked back at the streetlamp. The water had risen another inch while they spoke, and still the light burned. He thought about the storm drains he knew, the ones that should have swallowed this puddle hours ago, and realized they were silent. Not clogged — silent. As if the water had chosen to stay.",
      },
      {
        type: "paragraph",
        text: "\"Who are you?\" he asked.",
      },
      {
        type: "paragraph",
        text: "\"Someone who looked too long,\" she said. \"And now I can't stop seeing.\"",
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
        text: "Not the flicker of a dying bulb — he knew that flicker, had watched it a thousand times on a thousand streets. This was different. This was a pulse, like a heartbeat, like the city was breathing.",
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
        text: "That was the first thing he noticed, before the light, before the sound, before the vertigo that tilted the world and showed him what lay beneath the streets. The water was warm, as if it had come from somewhere deep underground, somewhere the sun had never touched and the rain had never reached.",
      },
      {
        type: "paragraph",
        text: "He knelt, his hand hovering over the surface, and the reflection looked back at him — not his face, but something older, something that had been waiting in the water for a long time.",
      },
      {
        type: "paragraph",
        text: "\"Don't touch it,\" the old woman's voice came from somewhere far away, or maybe from inside his head. \"Not until you're ready to be seen.\"",
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
      {
        type: "paragraph",
        text: "He woke in the pharmacy doorway, dry except for his shoes, the streetlamp burning normally above a puddle that drained even as he watched. The old woman was gone. The corner was empty. But in his pocket, folded small as a matchbook, he found a piece of paper with an address written in handwriting he did not recognize:",
      },
      {
        type: "paragraph",
        text: "\"The Underground. Stairwell behind the Meridian Hotel. Knock three times. Tell them the light sent you.\"",
      },
      {
        type: "paragraph",
        text: "Elias sat in the doorway until dawn, watching the streetlamp fade against the gray morning, and knew that his life had split into two parts: everything before the drowned light, and everything after.",
      },
      {
        type: "paragraph",
        text: "The city had finally noticed him.",
      },
      {
        type: "paragraph",
        text: "And he was not sure if that was a gift or a sentence.",
      },
    ]
  },
  {
    id: "chapter-two",
    number: 2,
    title: "The Underground",
    subtitle: "Elias descends",
    isFree: false,
    wordCount: 5100,
    content: [
      {
        type: "paragraph",
        text: "The Meridian Hotel had been closed for fifteen years, its windows boarded with plywood that peeled like sunburned skin, its lobby a cave of dust and pigeon feathers. Elias had passed it a hundred times without looking up, the way you learn not to look at the dead things in a city that pretends to be alive.",
      },
      {
        type: "paragraph",
        text: "But now he stood at the service entrance, the note crumpled in his fist, and looked at the stairwell that descended into darkness. The steps were concrete, worn smooth by decades of maids and bellhops, and they smelled of mildew and something else — something warm and metallic, like the water in the puddle.",
      },
      {
        type: "paragraph",
        text: "He knocked three times.",
      },
      {
        type: "paragraph",
        text: "The sound was wrong. Not the hollow echo of concrete, but a deep, resonant thrum, as if he had knocked on the skin of something vast and sleeping. The darkness at the bottom of the stairs shifted, and a voice came up — not from a person, but from the space itself:",
      },
      {
        type: "paragraph",
        text: "\"The light sent you.\"",
      },
      {
        type: "paragraph",
        text: "It was not a question.",
      },
      {
        type: "paragraph",
        text: "Elias stepped down. The stairs went deeper than they should have. He counted forty steps, then stopped counting. The air grew warmer, the darkness thicker, and he realized that the light he had followed was not above him anymore — it was below, rising up from the depths like a breath.",
      },
      {
        type: "paragraph",
        text: "At the bottom, the corridor opened into a space that could not exist beneath a hotel. It was a street, or a memory of a street, lined with buildings that had no doors but had windows that glowed with amber light. People moved through it — not many, but enough to make it feel inhabited. They wore clothes from different decades, different centuries, and none of them looked at him directly, but all of them seemed aware of him, the way you are aware of a draft in a closed room.",
      },
      {
        type: "paragraph",
        text: "\"First time?\" a man asked. He wore a bellhop uniform from the 1940s, the brass buttons tarnished green.",
      },
      {
        type: "paragraph",
        text: "\"Yes,\" Elias said.",
      },
      {
        type: "paragraph",
        text: "\"The light only sends the ones who see too much,\" the bellhop said. \"Or the ones who want to see more. Which are you?\"",
      },
      {
        type: "paragraph",
        text: "Elias thought about the drowned streetlamp, the warm water, the reflection that was not his face. \"I don't know,\" he said.",
      },
      {
        type: "paragraph",
        text: "\"Good answer.\" The bellhop smiled, and his teeth were the same amber color as the lights. \"The ones who know are the ones who stop looking.\"",
      },
      {
        type: "paragraph",
        text: "He gestured down the street, toward a building that looked like a library and a church and a subway station all at once. \"She's waiting for you. The one who sent the note. She's always waiting for the ones the light chooses.\"",
      },
      {
        type: "paragraph",
        text: "Elias walked toward the building, and the street watched him go.",
      },
    ]
  },
  {
    id: "chapter-three",
    number: 3,
    title: "The Forgotten",
    subtitle: "What the city remembers",
    isFree: false,
    wordCount: 4800,
    content: [
      {
        type: "paragraph",
        text: "The woman who waited was not the old woman from the corner. She was younger, or older, or both — it was hard to tell in the amber light, which seemed to smooth out some details and sharpen others. She sat behind a desk that was made of subway tiles and old newspaper, and she did not look up when Elias entered.",
      },
      {
        type: "paragraph",
        text: "\"You touched the water,\" she said. It was not a question.",
      },
      {
        type: "paragraph",
        text: "\"Yes.\"",
      },
      {
        type: "paragraph",
        text: "\"And you saw something.\"",
      },
      {
        type: "paragraph",
        text: "\"I saw...\" Elias paused. The memory was already softening at the edges, like a dream you try to hold onto. \"I saw a face. Not mine. Something older.\"",
      },
      {
        type: "paragraph",
        text: "The woman looked up then, and her eyes were the same amber as the streetlamp, the same amber as the lights in this impossible underground. \"The city has a memory,\" she said. \"Not the memory of people — the memory of itself. Every street that has been walked, every wall that has been touched, every light that has burned and died. It remembers. And sometimes, when the rain is right, when the light is right, it shows that memory to someone who is ready to see.\"",
      },
      {
        type: "paragraph",
        text: "\"Ready how?\"",
      },
      {
        type: "paragraph",
        text: "\"Ready to be forgotten,\" she said. \"Or ready to be remembered. The city doesn't distinguish. It only offers. You chose to touch the water. You chose to see. Now you are part of the memory, and the memory is part of you.\"",
      },
      {
        type: "paragraph",
        text: "Elias felt something cold in his chest, not fear but recognition, the way you recognize a street you have never walked but have dreamed about. \"What do I do now?\"",
      },
      {
        type: "paragraph",
        text: "\"You learn,\" she said. \"Or you leave. The door is always open, but the street only shows itself once. If you walk away now, you will remember this as a strange night, a dream, a story you tell when you're drunk. If you stay, you will become part of the story the city tells itself.\"",
      },
      {
        type: "paragraph",
        text: "She pushed a book across the desk. It was bound in something that looked like leather but felt like water when he touched it, cool and yielding. \"The history of the forgotten. Read it. Or don't. The choice is always yours. That's the only freedom the city allows.\"",
      },
      {
        type: "paragraph",
        text: "Elias opened the book. The first page was blank except for a single sentence:",
      },
      {
        type: "paragraph",
        text: "\"Every street remembers something. Every shadow hides a story. You are now part of both.\"",
      },
      {
        type: "paragraph",
        text: "He looked up to ask what it meant, but the woman was gone, and the desk was dust, and the amber light was fading to something darker, something deeper, something that felt like the beginning of a very long night.",
      },
    ]
  }
] satisfies BookChapter[];
export function getReaderChapters(): ReaderChapterData[] {
  return bookChapters.map((chapter, index) => {
    const paragraphs = chapter.content
      .filter((block) => block.type === "paragraph")
      .map((block) => block.text);

    return {
      slug: chapter.id,
      book: "The Drowned Streetlamp",
      title: chapter.title,
      eyebrow: chapter.isFree ? "Free Preview" : "Supporter Chapter",
      intro: paragraphs[0] || chapter.subtitle,
      paragraphs: paragraphs.slice(1),
      nextSlug: bookChapters[index + 1]?.id ?? null,
      number: chapter.number,
      subtitle: chapter.subtitle,
      isFree: chapter.isFree,
      wordCount: chapter.wordCount,
    };
  });
}

export function getSearchChapters() {
  return getReaderChapters().map((chapter) => ({
    slug: chapter.slug,
    title: chapter.number ? `Chapter ${chapter.number}: ${chapter.title}` : chapter.title,
    book: chapter.book,
    href: `/book?chapter=${chapter.slug}`,
    content: [
      chapter.eyebrow,
      chapter.subtitle ?? "",
      chapter.intro,
      ...chapter.paragraphs,
    ].join("\n\n"),
  }));
}
