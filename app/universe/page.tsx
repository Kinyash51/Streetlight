"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import FadeIn from "@/components/FadeIn";

type LoreCategory = "place" | "character" | "concept" | "event";
type SpoilerLevel = "safe" | "mild" | "major";

type LoreEntry = {
  id: string;
  title: string;
  category: LoreCategory;
  summary: string;
  details: string;
  marker: string;
  connections: string[];
  spoilerLevel: SpoilerLevel;
};

const loreEntries: LoreEntry[] = [
  {
    id: "the-city",
    title: "The City",
    category: "place",
    summary: "A nameless rain-soaked metropolis that remembers everyone it breaks.",
    details:
      "The city has no name because it does not need one. It remembers every person it breaks, every alley it swallows, and every streetlamp still burning through the rain. Streets shift when no one is looking. Alleys appear where there were none before.",
    marker: "01",
    connections: ["the-underground", "the-forgotten", "perpetual-rain"],
    spoilerLevel: "safe",
  },
  {
    id: "the-underground",
    title: "The Underground",
    category: "place",
    summary: "Hidden networks operating beneath the streets. Some protect. Some hunt.",
    details:
      "Beneath the streets, hidden networks move quietly. Some protect. Some hunt. Most people never notice them until it is too late. The underground has its own rules, its own debts, and its own reasons for staying unseen.",
    marker: "02",
    connections: ["the-city", "elias", "the-forgotten"],
    spoilerLevel: "mild",
  },
  {
    id: "the-forgotten",
    title: "The Forgotten",
    category: "concept",
    summary: "People the city erased, but never fully destroyed.",
    details:
      "The forgotten are not weak. They are survivors living in the spaces the city pretends do not exist. Some choose the shadows. Others were pushed there. All of them carry stories the city would rather bury.",
    marker: "03",
    connections: ["the-city", "the-underground", "elias"],
    spoilerLevel: "safe",
  },
  {
    id: "perpetual-rain",
    title: "Perpetual Rain",
    category: "concept",
    summary: "The weather is not background. It is part of the world.",
    details:
      "The rain has been falling for as long as anyone can remember. It gathers memory, blurs guilt, and turns every street into a mirror. In Streetlight, rain is atmosphere, warning, witness, and archive.",
    marker: "04",
    connections: ["the-city", "elias", "the-drowned-streetlamp"],
    spoilerLevel: "mild",
  },
  {
    id: "elias",
    title: "Elias",
    category: "character",
    summary: "A homeless teenager who sees what others miss.",
    details:
      "Elias has been drifting through the city long enough to know which doorways stay dry and which streetlamps flicker before they fail. He notices what others ignore, and that makes him dangerous to the city.",
    marker: "05",
    connections: ["the-city", "the-underground", "the-forgotten", "perpetual-rain"],
    spoilerLevel: "safe",
  },
  {
    id: "the-drowned-streetlamp",
    title: "The Drowned Streetlamp",
    category: "event",
    summary: "A streetlamp that burns underwater. The story begins here.",
    details:
      "At the corner of a street that has no name, a streetlamp stands in a pool of water that never drains. Its amber light should not survive the water, but it does. Elias sees it first, and the city starts watching back.",
    marker: "06",
    connections: ["the-city", "elias", "perpetual-rain"],
    spoilerLevel: "major",
  },
];

const timeline = [
  { label: "Before", event: "The city forgets its own name", type: "myth" },
  { label: "Year 0", event: "The rain begins and never stops", type: "event" },
  { label: "Later", event: "The underground networks form", type: "event" },
  { label: "After", event: "The first forgotten are recorded", type: "event" },
  { label: "Now", event: "Elias finds the drowned streetlamp", type: "story" },
];

const categoryLabels: Record<LoreCategory, string> = {
  place: "Places",
  character: "Characters",
  concept: "Concepts",
  event: "Events",
};

const spoilerLabels: Record<SpoilerLevel, string> = {
  safe: "Safe",
  mild: "Mild spoiler",
  major: "Major spoiler",
};

function SpoilerBadge({ level }: { level: SpoilerLevel }) {
  return <span className={`spoiler-badge spoiler-${level}`}>{spoilerLabels[level]}</span>;
}

function LoreCard({
  entry,
  onSelect,
}: {
  entry: LoreEntry;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      className="lore-card"
      onClick={onSelect}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.18 }}
      aria-label={`Open ${entry.title} lore`}
    >
      <span className="lore-card-marker">{entry.marker}</span>
      <div className="lore-card-header">
        <span className={`lore-category lore-category-${entry.category}`}>
          {categoryLabels[entry.category]}
        </span>
        <SpoilerBadge level={entry.spoilerLevel} />
      </div>
      <h2>{entry.title}</h2>
      <p>{entry.summary}</p>
      <span className="lore-card-action">Open file</span>
    </motion.button>
  );
}

function LoreDetail({
  entry,
  onClose,
}: {
  entry: LoreEntry;
  onClose: () => void;
}) {
  const connectedEntries = loreEntries.filter((item) => entry.connections.includes(item.id));

  return (
    <motion.div
      className="lore-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        className="lore-detail-panel"
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${entry.title} details`}
      >
        <button
          type="button"
          className="lore-detail-close"
          onClick={onClose}
          aria-label="Close details"
        >
          Close
        </button>

        <div className="lore-detail-header">
          <span className="lore-detail-marker">{entry.marker}</span>
          <div>
            <p className={`lore-category lore-category-${entry.category}`}>
              {categoryLabels[entry.category]}
            </p>
            <h2>{entry.title}</h2>
            <SpoilerBadge level={entry.spoilerLevel} />
          </div>
        </div>

        <p className="lore-detail-summary">{entry.summary}</p>
        <p className="lore-detail-text">{entry.details}</p>

        {connectedEntries.length ? (
          <div className="lore-detail-connections">
            <h3>Connected Files</h3>
            <div className="lore-connection-chips">
              {connectedEntries.map((connected) => (
                <span key={connected.id} className="lore-connection-chip">
                  {connected.marker} {connected.title}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="lore-detail-footer">
          <Link href="/read/chapter-one" className="btn-primary">
            Read Chapter One
          </Link>
        </div>
      </motion.article>
    </motion.div>
  );
}

export default function UniversePage() {
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | LoreCategory>("all");
  const [showTimeline, setShowTimeline] = useState(false);
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(loreEntries.map((entry) => entry.category)))] as const,
    [],
  );
  const filteredEntries =
    activeCategory === "all"
      ? loreEntries
      : loreEntries.filter((entry) => entry.category === activeCategory);

  return (
    <main className="universe-page">
      <section className="universe-hero">
        <FadeIn>
          <p className="section-tag">The World</p>
          <h1>The Streetlight Universe</h1>
          <p>
            A nameless city. Constant rain. Forgotten people. Hidden systems
            beneath the streets.
          </p>

          <div className="universe-stats" aria-label="Universe summary">
            <div>
              <strong>{loreEntries.length}</strong>
              <span>Lore Files</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Categories</span>
            </div>
            <div>
              <strong>{timeline.length}</strong>
              <span>Timeline Notes</span>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="universe-filter" aria-label="Universe controls">
        <div className="filter-tabs">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category === "all" ? "All Entries" : categoryLabels[category]}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`timeline-toggle ${showTimeline ? "active" : ""}`}
          onClick={() => setShowTimeline((current) => !current)}
        >
          {showTimeline ? "Hide Timeline" : "Show Timeline"}
        </button>
      </section>

      <AnimatePresence>
        {showTimeline ? (
          <motion.section
            className="universe-timeline"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="timeline-inner">
              <h2>Timeline of the City</h2>
              <div className="timeline-track">
                {timeline.map((item) => (
                  <div className={`timeline-event timeline-${item.type}`} key={item.event}>
                    <span className="timeline-dot" />
                    <div className="timeline-content">
                      <span className="timeline-year">{item.label}</span>
                      <span className="timeline-label">{item.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <section className="lore-grid-section">
        <div className="lore-grid">
          {filteredEntries.map((entry) => (
            <LoreCard
              key={entry.id}
              entry={entry}
              onSelect={() => setSelectedEntry(entry)}
            />
          ))}
        </div>
      </section>

      <section className="universe-spoiler-note">
        <p>
          Entries marked <strong>Major spoiler</strong> may reveal plot points.
          Read Chapter One first if you want to discover the city naturally.
        </p>
        <Link href="/read/chapter-one" className="btn-primary">
          Start Reading
        </Link>
      </section>

      <AnimatePresence>
        {selectedEntry ? (
          <LoreDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
