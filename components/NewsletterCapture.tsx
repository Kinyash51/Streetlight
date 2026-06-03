"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";

export default function NewsletterCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("Enter a valid email address.");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("Enter a valid email address.");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "homepage",
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error || "Could not save your email yet.");
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save your email yet.",
      );
      setStatus("error");
    }
  }

  return (
    <section className="newsletter-capture">
      <FadeIn>
        <div className="newsletter-inner">
          <div className="newsletter-copy">
            <p className="section-tag">Stay in the Light</p>
            <h2>New drops, without the noise.</h2>
            <p>
              Save your email for chapter updates, behind-the-scenes notes, and
              future Streetlight lore.
            </p>
          </div>

          {status === "success" ? (
            <div className="newsletter-success" role="status">
              <span aria-hidden="true">Saved</span>
              <p>You are on the Streetlight update list.</p>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <div className="newsletter-field">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status === "error") {
                      setStatus("idle");
                    }
                  }}
                  placeholder="your@email.com"
                  required
                  disabled={status === "submitting"}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Saving..." : "Notify me"}
                </button>
              </div>
              {status === "error" ? (
                <p className="newsletter-error" role="alert">
                  {errorMessage}
                </p>
              ) : null}
              <p className="newsletter-note">
                No spam. Just chapter drops, lore notes, and important reader updates.
              </p>
            </form>
          )}
        </div>
      </FadeIn>
    </section>
  );
}
