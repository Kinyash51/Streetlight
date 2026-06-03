"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

interface Subscription {
  tier: string | null;
  status: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: sub, error } = await supabase
          .from("subscriptions")
          .select("tier, status, current_period_end, cancel_at_period_end")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          const { data: fallbackSub } = await supabase
            .from("subscriptions")
            .select("tier, status")
            .eq("user_id", user.id)
            .maybeSingle();

          setSubscription((fallbackSub as Subscription | null) ?? null);
        } else {
          setSubscription((sub as Subscription | null) ?? null);
        }
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
          <Link href="/login?next=/dashboard" className="btn-primary">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    user.user_metadata?.username || user.email?.split("@")[0] || "Reader";
  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
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

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {displayName}</h1>
          <p>Your place in the Streetlight universe.</p>
        </div>

        <section className={`dashboard-card membership ${tierColor}`}>
          <div className="membership-header">
            <h2>Membership</h2>
            <span className={`membership-badge ${tierColor}`}>{tierLabel}</span>
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
              <span>Cancels {renewalDate ? `on ${renewalDate}` : "soon"}</span>
            </div>
          ) : null}

          {isPastDue ? (
            <div className="membership-status past-due">
              <span className="status-dot" />
              <span>Payment failed. Update your card.</span>
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

          {isActive ? (
            <form action="/api/portal" method="post" className="membership-billing">
              <button type="submit" className="btn-ghost">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Manage Billing
              </button>
            </form>
          ) : (
            <Link href="/community" className="btn-primary">
              Become a Supporter
            </Link>
          )}
        </section>

        <section className="dashboard-card books">
          <h2>My Books</h2>

          <div className="book-item">
            <div className="book-cover">
              <span>TS</span>
            </div>
            <div className="book-info">
              <h3>The Drowned Streetlamp</h3>
              <p>Book One · Chapter One live</p>
              <div className="book-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "45%" }} />
                </div>
                <span>45% read</span>
              </div>
            </div>
            <Link href="/read/chapter-one" className="btn-small">
              {isActive ? "Continue" : "Read Free"}
            </Link>
          </div>
        </section>

        {isActive ? (
          <section className="dashboard-card extras">
            <h2>Supporter Extras</h2>

            <div className="extra-list">
              <div className="extra-item">
                <span className="extra-icon">Note</span>
                <div>
                  <h4>Behind the Rain</h4>
                  <p>Notes on how the rain became more than atmosphere.</p>
                </div>
                <span className="extra-tag">New</span>
              </div>

              <div className="extra-item">
                <span className="extra-icon">Lore</span>
                <div>
                  <h4>The Underground</h4>
                  <p>Early draft lore. Elias descends for the first time.</p>
                </div>
                <span className="extra-tag">Preview</span>
              </div>

              <div className="extra-item">
                <span className="extra-icon">Talk</span>
                <div>
                  <h4>Community</h4>
                  <p>Reader notes, theories, and future chapter discussion.</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {isActive && subscription?.tier !== "free" ? (
          <section className="dashboard-card early-access">
            <h2>Early Access</h2>
            <p>Chapter Two is in progress. Read the draft as it develops.</p>
            <Link href="/community" className="btn-primary">
              Preview Updates
            </Link>
          </section>
        ) : null}

        {!isActive ? (
          <section className="dashboard-card beta-cta">
            <h2>Want to read the full draft?</h2>
            <p>
              Apply to the Streetlight Beta Program. Read more before launch
              and help shape the final version.
            </p>
            <Link href="/beta" className="btn-primary">
              Apply for Beta Access
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}
