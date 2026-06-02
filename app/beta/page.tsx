"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: submitError } = await supabase.from("beta_applications").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      why_noir: form.whyNoir.trim(),
      beta_experience: form.betaExperience,
      feedback_strength: form.feedbackStrength,
      can_finish_in_2_weeks: form.canFinish,
    });

    setLoading(false);

    if (submitError) {
      setError(submitError.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="beta-page">
        <section className="beta-container">
          <div className="beta-success">
            <div className="beta-success-icon" aria-hidden="true">
              SL
            </div>
            <h1>Application received</h1>
            <p>
              Thank you for wanting to read the draft. I review every
              application personally and will reach out if you are selected.
            </p>
            <p className="beta-success-note">
              The beta is limited to 10-20 readers. If you are not selected
              this round, you can still follow the public chapters.
            </p>
            <Link href="/" className="btn-primary">
              Back to Streetlight
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="beta-page">
      <section className="beta-container">
        <div className="beta-header">
          <span className="beta-label">Limited beta</span>
          <h1>Streetlight Beta Program</h1>
          <p>
            Read the deeper draft of <em>The Drowned Streetlamp</em> before it
            launches and help shape the final version with focused feedback.
          </p>
        </div>

        <div className="beta-details">
          <h2>What you get</h2>
          <ul>
            <li>Early draft access when the beta round opens</li>
            <li>A focused feedback path for story, pacing, and atmosphere</li>
            <li>A chance to help shape the Streetlight universe</li>
            <li>Your name considered for early reader credits</li>
          </ul>

          <h2>What I ask</h2>
          <ul>
            <li>Finish reading within the beta window</li>
            <li>Give honest feedback on what works and what does not</li>
            <li>Keep unreleased draft material private</li>
          </ul>
        </div>

        {error ? <div className="beta-error">{error}</div> : null}

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
              What draws you to urban noir fiction?
            </label>
            <textarea
              id="whyNoir"
              value={form.whyNoir}
              onChange={(event) =>
                setForm({ ...form, whyNoir: event.target.value })
              }
              placeholder="I love when cities feel like characters..."
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
              <option value="no">No, but I can give focused feedback</option>
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
              <option value="plot">Plot and pacing</option>
              <option value="character">Character voice</option>
              <option value="prose">Sentence-level prose</option>
              <option value="world">Worldbuilding and atmosphere</option>
              <option value="all">A mix of everything</option>
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
              <span>I can finish reading in the beta window.</span>
            </label>
          </div>

          <button type="submit" className="btn-primary btn-large" disabled={loading}>
            {loading ? "Submitting..." : "Apply for Beta Access"}
          </button>
        </form>

        <div className="beta-footer">
          <p>
            Already a Supporter?{" "}
            <Link href="/dashboard">Check your dashboard</Link> for current
            access.
          </p>
        </div>
      </section>
    </main>
  );
}
