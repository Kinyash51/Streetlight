"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { pricing } from "@/lib/pricing";

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (active) {
        setUser(currentUser);
        setLoading(false);
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="checkout-gateway-page">
        <div className="checkout-gateway-loading">
          <span className="spinner" aria-hidden="true" />
          <p>Checking access tiers...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-gateway-page">
      <section className="checkout-gateway-shell">
        <header className="checkout-gateway-header">
          <p className="reader-kicker">Access Portals</p>
          <h1>Choose your access tier</h1>
          <p>
            Support independent storytelling and unlock more of the
            rain-soaked Streetlight universe.
          </p>
        </header>

        {!user ? (
          <aside className="checkout-account-notice">
            <p>
              An account is required for subscription and reading-preference
              synchronization.
            </p>
            <Link href="/login?next=/checkout">Sign in before choosing</Link>
          </aside>
        ) : null}

        <div className="checkout-grid">
          <article className="reader-panel checkout-tier-card">
            <p className="reader-kicker">Free Tier</p>
            <h2>{pricing.freeReader.name}</h2>
            <div className="tier-price-row">
              <span className="currency">$</span>
              <span className="amount">0</span>
              <span className="period">/ forever</span>
            </div>
            <p className="dashboard-muted">
              Enter the story, explore public lore, and keep local reading
              progress without a paid membership.
            </p>

            <div className="tier-features-list">
              <Feature>Read Chapter One entirely free</Feature>
              <Feature>Explore public Streetlight lore</Feature>
              <Feature>Save highlights on this device</Feature>
            </div>

            <Link href="/read/chapter-one" className="btn-ghost checkout-tier-action">
              Start Reading
            </Link>
          </article>

          <article className="reader-panel checkout-tier-card tier-premium-card">
            <p className="reader-kicker">Recommended</p>
            <h2>{pricing.supporter.name}</h2>
            <div className="tier-price-row">
              <span className="currency">$</span>
              <span className="amount">
                {(pricing.supporter.amount / 100).toFixed(2)}
              </span>
              <span className="period">/ month</span>
            </div>
            <p className="dashboard-muted">
              Support the platform and receive expanded story access, early
              previews, and synchronized reader preferences.
            </p>

            <div className="tier-features-list">
              <Feature>Access available supporter chapters</Feature>
              <Feature>Synchronize reader preferences across devices</Feature>
              <Feature>Read early drafts and behind-the-scenes notes</Feature>
              <Feature>Join future community feedback rounds</Feature>
            </div>

            <button
              type="button"
              className="btn-primary checkout-tier-action checkout-disabled"
              disabled
            >
              Payments temporarily unavailable
            </button>
          </article>
        </div>

        <footer className="checkout-gateway-footer">
          <p>
            Secure billing will reopen after the new payment connection is
            ready. Questions? <Link href="/about">Contact creative operations.</Link>
          </p>
        </footer>
      </section>
    </main>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <div className="feature-check-item">
      <CheckIcon />
      <span>{children}</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
