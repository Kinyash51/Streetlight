"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";

const feedbackTypes = [
  ["loved", "Loved it"],
  ["confusing", "Confusing"],
  ["pacing", "Pacing"],
  ["character", "Character"],
  ["world", "Worldbuilding"],
  ["prose", "Prose"],
  ["typo", "Typo"],
] as const;

type BetaIdentity = {
  applicationId: string;
  userId: string;
  chapterSlug: string;
};

type ParagraphFeedbackProps = BetaIdentity & {
  paragraphIndex: number;
  selectedText: string;
};

export function ParagraphFeedback({
  applicationId,
  userId,
  chapterSlug,
  paragraphIndex,
  selectedText,
}: ParagraphFeedbackProps) {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("loved");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!comment.trim()) {
      setStatus("error");
      return;
    }

    setStatus("saving");
    const { error } = await supabase.from("beta_feedback").insert({
      application_id: applicationId,
      user_id: userId,
      chapter_slug: chapterSlug,
      paragraph_index: paragraphIndex,
      selected_text: selectedText.slice(0, 1600),
      feedback_type: feedbackType,
      comment: comment.trim(),
    });

    if (error) {
      setStatus("error");
      return;
    }

    setComment("");
    setStatus("saved");
    window.setTimeout(() => {
      setOpen(false);
      setStatus("idle");
    }, 1200);
  }

  return (
    <div className="beta-paragraph-feedback">
      <button
        type="button"
        className="beta-feedback-trigger"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          setStatus("idle");
        }}
      >
        {open ? "Close note" : "Leave private feedback"}
      </button>

      {open ? (
        <form className="beta-feedback-form" onSubmit={submitFeedback}>
          <p className="beta-feedback-context">{selectedText}</p>
          <div className="beta-feedback-types" aria-label="Feedback category">
            {feedbackTypes.map(([value, label]) => (
              <button
                type="button"
                className={feedbackType === value ? "active" : ""}
                key={value}
                onClick={() => setFeedbackType(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label>
            Private note
            <textarea
              value={comment}
              rows={3}
              maxLength={2000}
              placeholder="What worked, slowed you down, or needs another look?"
              onChange={(event) => {
                setComment(event.target.value);
                setStatus("idle");
              }}
            />
          </label>
          <div className="beta-feedback-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={status === "saving"}
            >
              {status === "saving" ? "Saving..." : "Send Private Note"}
            </button>
            {status === "saved" ? <span>Feedback saved.</span> : null}
            {status === "error" ? (
              <span className="beta-feedback-error">
                Add a note, then try again.
              </span>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function BetaChapterReview({
  applicationId,
  userId,
  chapterSlug,
}: BetaIdentity) {
  const [rating, setRating] = useState(0);
  const [attentionDrop, setAttentionDrop] = useState("");
  const [confusing, setConfusing] = useState("");
  const [memorableMoment, setMemorableMoment] = useState("");
  const [continueReading, setContinueReading] = useState<boolean | null>(null);
  const [overallNotes, setOverallNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rating) {
      setStatus("error");
      return;
    }

    setStatus("saving");
    const { error } = await supabase.from("beta_chapter_reviews").upsert(
      {
        application_id: applicationId,
        user_id: userId,
        chapter_slug: chapterSlug,
        rating,
        attention_drop: attentionDrop.trim() || null,
        confusing: confusing.trim() || null,
        memorable_moment: memorableMoment.trim() || null,
        continue_reading: continueReading,
        overall_notes: overallNotes.trim() || null,
      },
      { onConflict: "user_id,chapter_slug" },
    );

    setStatus(error ? "error" : "saved");
  }

  return (
    <section className="beta-chapter-review">
      <p className="section-tag">Private Beta Review</p>
      <h2>How did this chapter land?</h2>
      <p>
        Short, honest notes are more useful than polished criticism. Only the
        writer can access this feedback.
      </p>

      <form onSubmit={submitReview}>
        <fieldset>
          <legend>Overall chapter rating</legend>
          <div className="beta-rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                className={rating === value ? "active" : ""}
                aria-label={`${value} out of 5`}
                aria-pressed={rating === value}
                key={value}
                onClick={() => {
                  setRating(value);
                  setStatus("idle");
                }}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          Where did your attention drop?
          <textarea
            rows={2}
            value={attentionDrop}
            onChange={(event) => setAttentionDrop(event.target.value)}
          />
        </label>
        <label>
          What was confusing?
          <textarea
            rows={2}
            value={confusing}
            onChange={(event) => setConfusing(event.target.value)}
          />
        </label>
        <label>
          Which moment stayed with you?
          <textarea
            rows={2}
            value={memorableMoment}
            onChange={(event) => setMemorableMoment(event.target.value)}
          />
        </label>

        <fieldset>
          <legend>Would you continue reading?</legend>
          <div className="beta-choice">
            <button
              type="button"
              className={continueReading === true ? "active" : ""}
              onClick={() => setContinueReading(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={continueReading === false ? "active" : ""}
              onClick={() => setContinueReading(false)}
            >
              Not yet
            </button>
          </div>
        </fieldset>

        <label>
          Anything else?
          <textarea
            rows={3}
            value={overallNotes}
            onChange={(event) => setOverallNotes(event.target.value)}
          />
        </label>

        <div className="beta-review-submit">
          <button
            type="submit"
            className="btn-primary"
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Save Chapter Review"}
          </button>
          {status === "saved" ? <span>Review saved.</span> : null}
          {status === "error" ? (
            <span className="beta-feedback-error">
              Choose a rating and try again.
            </span>
          ) : null}
        </div>
      </form>
    </section>
  );
}
