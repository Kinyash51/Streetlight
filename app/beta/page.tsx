"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [form, setForm] = useState<BetaForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplicant() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        const { data: application } = await supabase
          .from("beta_applications")
          .select("status")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        setApplicationStatus(application?.status ?? null);
        setForm((current) => ({
          ...current,
          name:
            currentUser.user_metadata?.name ??
            currentUser.user_metadata?.username ??
            current.name,
          email: currentUser.email ?? current.email,
        }));
      }

      setAuthLoading(false);
    }

    loadApplicant();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError("Sign in before submitting your application.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: submitError } = await supabase
        .from("beta_applications")
        .insert({
          user_id: user.id,
          name: form.name.trim(),
          email: form.email.trim(),
          why_noir: form.whyNoir.trim(),
          beta_experience: form.betaExperience,
          feedback_strength: form.feedbackStrength,
          can_finish_in_2_weeks: form.canFinish,
        });

      if (submitError) throw submitError;
      setApplicationStatus("pending");
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

  if (authLoading) {
    return (
      <main className="beta-page">
        <div className="beta-container beta-gate">
          <p className="section-tag">Beta Readers</p>
          <h1>Checking your application...</h1>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="beta-page">
        <div className="beta-container beta-gate">
          <p className="section-tag">Private Reader Program</p>
          <h1>Sign in before applying.</h1>
          <p>
            Your account keeps the draft private and connects every paragraph
            note to your application.
          </p>
          <Link href="/login?next=/beta" className="btn-primary">
            Sign In to Apply
          </Link>
          <Link href="/read/chapter-one" className="btn-ghost">
            Read Chapter One First
          </Link>
        </div>
      </main>
    );
  }

  if (applicationStatus && !submitted) {
    const statusCopy: Record<string, { title: string; body: string }> = {
      pending: {
        title: "Your application is under review.",
        body: "You will see the decision here as soon as the beta application is reviewed.",
      },
      approved: {
        title: "You are an approved beta reader.",
        body: "The complete available draft and private feedback tools are now open in your reader.",
      },
      completed: {
        title: "Beta reading completed.",
        body: "Your notes are saved. Thank you for helping shape Streetlight.",
      },
      rejected: {
        title: "This beta round is full.",
        body: "Your account remains ready for a future Streetlight reading round.",
      },
    };
    const status = statusCopy[applicationStatus] ?? statusCopy.pending;

    return (
      <main className="beta-page">
        <div className="beta-container beta-gate">
          <span className={`beta-status beta-status-${applicationStatus}`}>
            {applicationStatus}
          </span>
          <h1>{status.title}</h1>
          <p>{status.body}</p>
          <Link
            href={applicationStatus === "approved" ? "/book" : "/dashboard"}
            className="btn-primary"
          >
            {applicationStatus === "approved" ? "Open the Draft" : "View Dashboard"}
          </Link>
        </div>
      </main>
    );
  }

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
              readOnly
              aria-readonly="true"
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
            Your application and private feedback status will appear on your{" "}
            <Link href="/dashboard">reader dashboard</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
