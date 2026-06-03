"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

type BetaForm = {
  name: string;
  email: string;
  whyNoir: string;
  betaExperience: string;
  feedbackStrength: string;
  canFinish: boolean;
};

const initialForm: BetaForm = {
  name: "",
  email: "",
  whyNoir: "",
  betaExperience: "",
  feedbackStrength: "",
  canFinish: false,
};

export default function BetaPage() {
  const [form, setForm] = useState<BetaForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: submitError } = await supabase
        .from("beta_applications")
        .insert({
          name: form.name.trim(),
          email: form.email.trim(),
          why_noir: form.whyNoir.trim(),
          beta_experience: form.betaExperience,
          feedback_strength: form.feedbackStrength,
          can_finish_in_2_weeks: form.canFinish,
        });

      if (submitError) throw submitError;
      setSubmitted(true);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="beta-page">
        <div className="beta-container">
          <div className="beta-success">
            <div className="beta-success-icon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1>Application received</h1>
            <p>
              Thank you for wanting to read the draft. I review every
              application personally and will reach out within 48 hours if you
              are selected.
            </p>
            <p className="beta-success-note">
              The beta is limited to 10-20 readers. If you are not selected this
              round, you will be first in line for the next one.
            </p>
            <Link href="/" className="btn-primary">
              Back to Streetlight
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="beta-page">
      <div className="beta-container">
        <div className="beta-header">
          <span className="beta-label">Limited to 20 readers</span>
          <h1>Streetlight Beta Program</h1>
          <p>
            Read the complete draft of <em>The Drowned Streetlamp</em> before it
            launches. Help shape the final version with your feedback.
          </p>
        </div>

        <div className="beta-details">
          <h2>What you get</h2>
          <ul>
            <li>Full access to the 28,000-word draft</li>
            <li>Inline feedback form - comment on any paragraph</li>
            <li>Private group chat with other beta readers</li>
            <li>Your name in the Early Readers credits</li>
            <li>Free copy of the finished eBook at launch</li>
          </ul>

          <h2>What I ask</h2>
          <ul>
            <li>Finish reading within 2 weeks</li>
            <li>Submit feedback through the built-in form</li>
            <li>Keep the draft confidential - no spoilers</li>
            <li>
              Tell me what worked, what did not, and what you wanted more of
            </li>
          </ul>
        </div>

        {error ? (
          <div className="beta-error">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="beta-form">
          <div className="beta-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Your name"
              required
              disabled={loading}
            />
          </div>

          <div className="beta-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="beta-field">
            <label htmlFor="whyNoir">
              What draws you to urban noir fiction? <span>(1-2 sentences)</span>
            </label>
            <textarea
              id="whyNoir"
              value={form.whyNoir}
              onChange={(event) =>
                setForm({ ...form, whyNoir: event.target.value })
              }
              placeholder="I love how cities become characters..."
              required
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="beta-field">
            <label htmlFor="betaExperience">Have you beta read before?</label>
            <select
              id="betaExperience"
              value={form.betaExperience}
              onChange={(event) =>
                setForm({ ...form, betaExperience: event.target.value })
              }
              required
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="yes">Yes, I have beta read before</option>
              <option value="no">No, but I am eager to learn</option>
              <option value="writer">I am a writer myself</option>
            </select>
          </div>

          <div className="beta-field">
            <label htmlFor="feedbackStrength">
              What kind of feedback do you give best?
            </label>
            <select
              id="feedbackStrength"
              value={form.feedbackStrength}
              onChange={(event) =>
                setForm({ ...form, feedbackStrength: event.target.value })
              }
              required
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="plot">Plot holes and pacing</option>
              <option value="character">Character voice and motivation</option>
              <option value="prose">Sentence-level prose and style</option>
              <option value="world">Worldbuilding and atmosphere</option>
              <option value="all">I can do it all</option>
            </select>
          </div>

          <div className="beta-field checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.canFinish}
                onChange={(event) =>
                  setForm({ ...form, canFinish: event.target.checked })
                }
                required
                disabled={loading}
              />
              <span>I can finish reading within 2 weeks and submit feedback.</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <span className="beta-loading">
                <svg
                  className="spinner"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="60"
                    strokeDashoffset="20"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              "Apply for Beta Access"
            )}
          </button>
        </form>

        <div className="beta-footer">
          <p>
            Already a Supporter?{" "}
            <Link href="/dashboard">Check your dashboard</Link> for beta access.
          </p>
        </div>
      </div>
    </main>
  );
}
