"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

function SuccessLoading() {
  return (
    <main className="success-page">
      <div className="success-loading">
        <div className="success-spinner" />
        <p>Confirming your place in the light...</p>
      </div>
    </main>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      const timer = window.setTimeout(() => setStatus("error"), 0);
      return () => window.clearTimeout(timer);
    }

    let attempts = 0;
    const maxAttempts = 10;

    const interval = window.setInterval(async () => {
      attempts += 1;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("tier, status")
          .eq("user_id", user.id)
          .in("status", ["active", "trialing"])
          .maybeSingle();

        if (sub?.status === "active" || sub?.status === "trialing") {
          setTier(sub.tier);
          setStatus("success");
          window.clearInterval(interval);
          return;
        }
      }

      if (attempts >= maxAttempts) {
        setStatus("success");
        window.clearInterval(interval);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [sessionId]);

  if (status === "loading") {
    return <SuccessLoading />;
  }

  if (status === "error") {
    return (
      <main className="success-page">
        <div className="success-container error">
          <h1>Something went wrong</h1>
          <p>
            We could not confirm your payment. If you were charged, check your
            email or contact support.
          </p>
          <Link href="/community" className="btn-primary">
            Back to Community
          </Link>
        </div>
      </main>
    );
  }

  const tierName = tier === "patron" ? "Patron" : tier ? "Supporter" : "Reader";
  const tierColor = tier === "patron" ? "patron" : "supporter";

  return (
    <main className="success-page">
      <div className="success-container">
        <div className="success-celebration">
          <div className="success-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1>You&apos;re in the light.</h1>
          <p className={`success-tier ${tierColor}`}>Welcome, {tierName}.</p>
        </div>

        <div className="success-next">
          <h2>What happens next</h2>

          <div className="success-steps">
            <div className="success-step">
              <span className="step-number">1</span>
              <div>
                <h3>Check your email</h3>
                <p>Your receipt and Streetlight details should arrive shortly.</p>
              </div>
            </div>

            <div className="success-step">
              <span className="step-number">2</span>
              <div>
                <h3>Start reading</h3>
                <p>Open Chapter One or head to your dashboard for your access.</p>
              </div>
            </div>

            <div className="success-step">
              <span className="step-number">3</span>
              <div>
                <h3>Explore the extras</h3>
                <p>Supporter and Patron content appears as your access syncs.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link href="/read/chapter-one" className="btn-primary btn-large">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Start Reading
          </Link>

          <Link href="/dashboard" className="btn-ghost btn-large">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Go to Dashboard
          </Link>
        </div>

        <div className="success-preview">
          <h2>What you unlocked</h2>

          <div className="preview-grid">
            <div className="preview-item">
              <span className="preview-icon">Read</span>
              <h4>Streetlight Access</h4>
              <p>Your payment is connected to your reader account.</p>
            </div>

            <div className="preview-item">
              <span className="preview-icon">Book</span>
              <h4>The Drowned Streetlamp</h4>
              <p>Return to the story from your dashboard or the reader.</p>
            </div>

            <div className="preview-item">
              <span className="preview-icon">Notes</span>
              <h4>Behind the Scenes</h4>
              <p>Supporter extras unlock as membership access syncs.</p>
            </div>

            <div className="preview-item">
              <span className="preview-icon">Talk</span>
              <h4>Community</h4>
              <p>Discuss theories and lore with other readers.</p>
            </div>
          </div>
        </div>

        <div className="success-footer">
          <p>
            Questions?{" "}
            <Link href="mailto:hello@streetlightstory.site">
              hello@streetlightstory.site
            </Link>
          </p>
          <p className="success-thanks">
            Every street remembers something. Thank you for remembering this one.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}
