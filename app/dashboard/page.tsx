"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { User } from "@supabase/supabase-js";

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
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const [
          { data: sub },
          { data: application },
          { count: paragraphNotes },
          { count: chapterReviews },
        ] = await Promise.all([
          supabase
            .from("subscriptions")
            .select("tier, status, current_period_end, cancel_at_period_end")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("beta_applications")
            .select("id, status, reading_deadline")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("beta_feedback")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("beta_chapter_reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        setSubscription(sub);
        setBetaApplication(application as BetaApplication | null);
        setFeedbackCount(paragraphNotes ?? 0);
        setReviewCount(chapterReviews ?? 0);
      }

      setLoading(false);
    };

    getData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner" />
          <p>Loading your street...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty">
          <h2>You need to be signed in</h2>
          <p>Sign in to see your dashboard and reading progress.</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const displayName = user.user_metadata?.username || user.email?.split("@")[0] || "Reader";
  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";
  const isCanceled = subscription?.status === "canceled" || subscription?.cancel_at_period_end;

  const renewalDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const tierLabel = subscription?.tier === "patron" 
    ? "Patron" 
    : subscription?.tier === "supporter" 
    ? "Supporter" 
    : "Free Reader";

  const tierColor = subscription?.tier === "patron" 
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
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {displayName}</h1>
          <p>Your place in the Streetlight universe.</p>
        </div>

        {/* Membership Card */}
        <div className={`dashboard-card membership ${tierColor}`}>
          <div className="membership-header">
            <h2>Membership</h2>
            <span className={`membership-badge ${tierColor}`}>{tierLabel}</span>
          </div>

          {isActive && !isCanceled && (
            <div className="membership-status active">
              <span className="status-dot" />
              <span>Active</span>
            </div>
          )}

          {isActive && isCanceled && (
            <div className="membership-status canceled">
              <span className="status-dot" />
              <span>Cancels on {renewalDate}</span>
            </div>
          )}

          {isPastDue && (
            <div className="membership-status past-due">
              <span className="status-dot" />
              <span>Payment needs attention</span>
            </div>
          )}

          {!isActive && !subscription && (
            <div className="membership-status free">
              <span className="status-dot" />
              <span>Free Reader</span>
            </div>
          )}

          {renewalDate && isActive && (
            <div className="membership-renewal">
              <span>Renews</span>
              <strong>{renewalDate}</strong>
            </div>
          )}

          {!isActive && (
            <Link href="/checkout" className="btn-primary">
              View Access Options
            </Link>
          )}
        </div>

        {/* My Books */}
        <div className="dashboard-card books">
          <h2>My Books</h2>

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
        </div>

        {/* Supporter Extras */}
        {isActive && (
          <div className="dashboard-card extras">
            <h2>Supporter Extras</h2>

            <div className="extra-list">
              <div className="extra-item">
                <span className="extra-icon">📝</span>
                <div>
                  <h4>Behind the Rain</h4>
                  <p>Notes on how the rain became more than atmosphere.</p>
                </div>
                <span className="extra-tag">New</span>
              </div>

              <div className="extra-item">
                <span className="extra-icon">🗺️</span>
                <div>
                  <h4>The Underground</h4>
                  <p>Early draft lore — Elias descends for the first time.</p>
                </div>
                <span className="extra-tag">Preview</span>
              </div>

              <div className="extra-item">
                <span className="extra-icon">💬</span>
                <div>
                  <h4>Community</h4>
                  <p>12 new messages since your last visit.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Early Access */}
        {isActive && subscription?.tier !== "free" && (
          <div className="dashboard-card early-access">
            <h2>Early Access</h2>
            <p>Chapter Two is in progress. Read the draft as it develops.</p>
            <Link href="/book?chapter=two" className="btn-primary">
              Preview Chapter Two
            </Link>
          </div>
        )}

        {/* Beta Program */}
        {betaApplication ? (
          <div className="dashboard-card beta-cta">
            <div className="membership-header">
              <h2>Beta Reader</h2>
              <span className={`beta-status beta-status-${betaApplication.status}`}>
                {betaStatusLabel}
              </span>
            </div>
            {betaApplication.status === "approved" ||
            betaApplication.status === "completed" ? (
              <>
                <p>
                  Your private manuscript feedback tools are active inside the
                  book reader.
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
          </div>
        ) : !isActive ? (
          <div className="dashboard-card beta-cta">
            <h2>Want to read the full draft?</h2>
            <p>Apply to the Streetlight Beta Program. Read the complete story before launch and help shape the final version.</p>
            <Link href="/beta" className="btn-primary">
              Apply for Beta Access
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
