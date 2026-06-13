"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getProgressChapterSlug,
  readReaderProgress,
  type ReaderProgress,
} from "@/lib/reader-progress";

type ContinueChapter = {
  slug: string;
  number?: number;
  title: string;
  wordCount?: number;
};

function getTimeRemaining(progress: ReaderProgress, wordCount = 0) {
  const totalMinutes = Math.max(1, Math.ceil(wordCount / 210));
  const remaining = Math.max(
    1,
    Math.ceil(totalMinutes * ((100 - progress.progressPercent) / 100)),
  );

  return progress.progressPercent >= 95 ? "Ready to revisit" : `${remaining} min left`;
}

export default function ContinueReading({
  chapters,
}: {
  chapters: ContinueChapter[];
}) {
  const [progress, setProgress] = useState<ReaderProgress | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(readReaderProgress()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!progress) {
    return null;
  }

  const slug = getProgressChapterSlug(progress.chapterSlug);
  const chapter = chapters.find((item) => item.slug === slug);

  if (!chapter) {
    return null;
  }

  const percent = Math.round(progress.progressPercent);
  const action = percent >= 95 ? "Read again" : "Continue reading";

  return (
    <section className="continue-reading-section" aria-labelledby="continue-reading-title">
      <div className="continue-reading-card">
        <div className="continue-reading-art" aria-hidden="true">
          <span>{chapter.number ?? "S"}</span>
        </div>

        <div className="continue-reading-copy">
          <p className="section-tag">Your reading</p>
          <h2 id="continue-reading-title">{action}</h2>
          <strong>
            {chapter.number ? `Chapter ${chapter.number}` : "Streetlight"} · {chapter.title}
          </strong>
          <div className="continue-reading-meta">
            <span>{percent}% complete</span>
            <span>{getTimeRemaining(progress, chapter.wordCount)}</span>
            <span>Saved on this device</span>
          </div>
          <div
            className="continue-reading-progress"
            role="progressbar"
            aria-label={`${percent}% complete`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>

        <Link href={`/book?chapter=${slug}`} className="btn-primary">
          {action}
        </Link>
      </div>
    </section>
  );
}
