"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

interface Subscription {
  tier: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface BetaApplication {
  id: string;
  status: "pending" | "approved" | "rejected" | "completed";
  reading_deadline: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [betaApplication, setBetaApplication] = useState<BetaApplication | null>(
    null,
  );
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        const [
          { data: sub },
          { data: application },
          { count: paragraphNotes },
          { count: chapterReviews },
        ] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("tier, status, current_period_end, cancel_at_period_end")
            .eq("user_id", currentUser.id)
            .maybeSingle(),
          supabase
            .from("beta_applications")
            .select("id, status, reading_deadline")
            .eq("user_id", currentUser.id)
            .maybeSingle(),
          supabase
            .from("beta_feedback")
            .select("id", { count: "exact", head: true })
            .eq("user_id", currentUser.id),
          supabase
            .from("beta_chapter_reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", currentUser.id),
        ]);

        setSubscription(sub);
        setBetaApplication(application as BetaApplication | null);
        setFeedbackCount(paragraphNotes ?? 0);
        setReviewCount(chapterReviews ?? 0);
      }

      setLoading(false);
    }

    getData();
  }, []);

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner" />
          <p>Loading your street...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-empty">
          <h2>You need to be signed in</h2>
          <p>Sign in to see your dashboard and reading progress.</p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    user.user_metadata?.username || user.email?.split("@")[0] || "Reader";
  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const isCanceled =
    subscription?.status === "canceled" || subscription?.cancel_at_period_end;
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const tierLabel =
    subscription?.tier === "patron"
      ? "Patron"
      : subscription?.tier === "supporter"
        ? "Supporter"
        : "Free Reader";
  const tierColor =
    subscription?.tier === "patron"
      ? "patron"
      : subscription?.tier === "supporter"
        ? "supporter"
        : "free";
  const betaStatusLabel =
    betaApplication?.status === "approved"
      ? "Approved"
      : betaApplication?.status === "completed"
        ? "Completed"
        : betaApplication?.status === "rejected"
          ? "Not selected"
          : "Pending review";
  const betaDeadline = betaApplication?.reading_deadline
    ? new Date(betaApplication.reading_deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-hero">
          <div className="dashboard-profile-info">
            <p className="section-tag">Reader Dashboard</p>
            <h1>Welcome back, {displayName}</h1>
            <p>Your place in the Streetlight universe.</p>
          </div>
          <div className="tier-pill-wrapper">
            <span className={`tier-indicator-dot ${tierColor}`} />
            <span>{tierLabel}</span>
          </div>
        </header>

        <section className="dashboard-grid" aria-label="Reader metrics">
          <article className="metric-card">
            <span>Reading progress</span>
            <strong>45%</strong>
          </article>
          <article className="metric-card">
            <span>Paragraph notes</span>
            <strong>{feedbackCount}</strong>
          </article>
          <article className="metric-card">
            <span>Chapter reviews</span>
            <strong>{reviewCount}</strong>
          </article>
        </section>

        <section className="dashboard-split-panels">
          <div className="panel-main-canvas">
            <div>
              <p className="section-tag">Your Library</p>
              <h2>Continue reading</h2>
            </div>

            <article className="dashboard-mini-note dashboard-book-panel">
              <div className="book-item">
                <div className="book-cover">
                  <span>TS</span>
                </div>
                <div className="book-info">
                  <h3>The Drowned Streetlamp</h3>
                  <p>Book One · 28,000 words</p>
                  <div className="book-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: "45%" }} />
                    </div>
                    <span>45% read</span>
                  </div>
                </div>
                <Link href="/book" className="btn-small">
                  {isActive ? "Continue" : "Read Free"}
                </Link>
              </div>
            </article>

            {isActive ? (
              <div className="dashboard-extras">
                <div>
                  <p className="section-tag">Supporter Extras</p>
                  <h2>From behind the rain</h2>
                </div>
                <div className="extra-list">
                  <article className="dashboard-mini-note">
                    <span className="extra-tag">New</span>
                    <h3>Behind the Rain</h3>
                    <p>Notes on how the rain became more than atmosphere.</p>
                  </article>
                  <article className="dashboard-mini-note">
                    <span className="extra-tag">Preview</span>
                    <h3>The Underground</h3>
                    <p>Early draft lore: Elias descends for the first time.</p>
                  </article>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="panel-sidebar-controls">
            <article className="sidebar-card-box">
              <div className="membership-header">
                <h3>Membership</h3>
                <span className={`membership-badge ${tierColor}`}>
                  {tierLabel}
                </span>
              </div>

              {isActive && !isCanceled ? (
                <div className="membership-status active">
                  <span className="status-dot" />
                  <span>Active</span>
                </div>
              ) : null}

              {isActive && isCanceled ? (
                <div className="membership-status canceled">
                  <span className="status-dot" />
                  <span>Cancels on {renewalDate}</span>
                </div>
              ) : null}

              {isPastDue ? (
                <div className="membership-status past-due">
                  <span className="status-dot" />
                  <span>Payment needs attention</span>
                </div>
              ) : null}

              {!isActive && !subscription ? (
                <div className="membership-status free">
                  <span className="status-dot" />
                  <span>Free Reader</span>
                </div>
              ) : null}

              {renewalDate && isActive ? (
                <div className="membership-renewal">
                  <span>Renews</span>
                  <strong>{renewalDate}</strong>
                </div>
              ) : null}

              {!isActive ? (
                <Link href="/checkout" className="btn-primary">
                  View Access Options
                </Link>
              ) : null}
            </article>

            {isActive && subscription?.tier !== "free" ? (
              <article className="sidebar-card-box early-access">
                <h3>Early Access</h3>
                <p>Chapter Two is in progress. Read the draft as it develops.</p>
                <Link href="/book?chapter=two" className="btn-primary">
                  Preview Chapter Two
                </Link>
              </article>
            ) : null}

            {betaApplication ? (
              <article className="sidebar-card-box beta-cta">
                <div className="membership-header">
                  <h3>Beta Reader</h3>
                  <span
                    className={`beta-status beta-status-${betaApplication.status}`}
                  >
                    {betaStatusLabel}
                  </span>
                </div>
                {betaApplication.status === "approved" ||
                betaApplication.status === "completed" ? (
                  <>
                    <p>
                      Your private manuscript feedback tools are active inside
                      the book reader.
                    </p>
                    <div className="dashboard-list">
                      <div>
                        <span>Paragraph notes</span>
                        <strong>{feedbackCount}</strong>
                      </div>
                      <div>
                        <span>Chapter reviews</span>
                        <strong>{reviewCount}</strong>
                      </div>
                      {betaDeadline ? (
                        <div>
                          <span>Reading deadline</span>
                          <strong>{betaDeadline}</strong>
                        </div>
                      ) : null}
                    </div>
                    <Link href="/book" className="btn-primary">
                      Open Beta Draft
                    </Link>
                  </>
                ) : (
                  <>
                    <p>
                      {betaApplication.status === "rejected"
                        ? "This reading group is currently full. Your account remains ready for the next round."
                        : "Your application is waiting for review. The decision will appear here."}
                    </p>
                    <Link href="/beta" className="btn-ghost">
                      View Application
                    </Link>
                  </>
                )}
              </article>
            ) : !isActive ? (
              <article className="sidebar-card-box beta-cta">
                <h3>Beta Program</h3>
                <p>
                  Read the complete story before launch and help shape the final
                  version.
                </p>
                <Link href="/beta" className="btn-primary">
                  Apply for Beta Access
                </Link>
              </article>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}
