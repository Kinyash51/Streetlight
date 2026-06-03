"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { pricing } from "@/lib/pricing";
import { supabase } from "@/lib/supabase-client";

type SuccessProduct = "ebook" | "supporter" | "patron" | "reader";

function normalizeProduct(product: string | null): SuccessProduct {
  if (
    product === pricing.ebook.checkoutProduct ||
    product === pricing.supporter.checkoutProduct ||
    product === pricing.patron.checkoutProduct
  ) {
    return product;
  }

  return "reader";
}

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
  const product = normalizeProduct(searchParams.get("product"));
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [tier, setTier] = useState<SuccessProduct>(
    product === "reader" ? "supporter" : product
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setTier(product === "reader" ? "supporter" : product);
          setStatus("success");
          return;
        }

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("tier, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sub?.status === "active" || sub?.status === "trialing") {
          setTier(normalizeProduct(sub.tier));
        } else if (product !== "reader") {
          setTier(product);
        } else if (!sessionId) {
          setTier("reader");
        } else {
          setTier("supporter");
        }

        setStatus("success");
      } catch {
        setTier(product === "reader" ? "supporter" : product);
        setStatus("success");
      }
    };

    checkSession();
  }, [product, sessionId]);

  if (status === "loading") {
    return <SuccessLoading />;
  }

  const tierName =
    tier === "patron"
      ? "Patron"
      : tier === "ebook" || tier === "reader"
        ? "Reader"
        : "Supporter";
  const tierColor = tier === "patron" ? "patron" : "supporter";
  const isEbook = tier === "ebook";
  const headline = isEbook ? "Your book is ready." : "You're in the light.";
  const accessLine = isEbook
    ? `Your ${pricing.ebook.price} eBook purchase is ready.`
    : `Welcome, ${tierName}.`;

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
          <h1>{headline}</h1>
          <p className={`success-tier ${tierColor}`}>{accessLine}</p>
        </div>

        <div className="success-next">
          <h2>What happens next</h2>

          <div className="success-steps">
            <div className="success-step">
              <span className="step-number">1</span>
              <div>
                <h3>Check your email</h3>
                <p>
                  {isEbook
                    ? "Your receipt should arrive shortly."
                    : "We sent a welcome note with your membership details."}
                </p>
              </div>
            </div>

            <div className="success-step">
              <span className="step-number">2</span>
              <div>
                <h3>Start reading</h3>
                <p>
                  {isEbook
                    ? "Open the reader and start The Drowned Streetlamp."
                    : "The reader is ready. Pick up where you left off."}
                </p>
              </div>
            </div>

            <div className="success-step">
              <span className="step-number">3</span>
              <div>
                <h3>Explore the extras</h3>
                <p>
                  {isEbook
                    ? "Membership extras remain separate from the one-time eBook."
                    : "Behind-the-scenes notes, early drafts, and community access."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link href="/book" className="btn-primary btn-large">
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
              <h4>{isEbook ? "Full eBook" : "Reader Access"}</h4>
              <p>
                {isEbook
                  ? "The Drowned Streetlamp is ready in your reader."
                  : "Your reader access is connected to your account."}
              </p>
            </div>

            <div className="preview-item">
              <span className="preview-icon">Notes</span>
              <h4>Behind the Scenes</h4>
              <p>
                {isEbook
                  ? "Supporter notes are available with monthly membership."
                  : "Notes on Elias, the rain, and the city."}
              </p>
            </div>

            <div className="preview-item">
              <span className="preview-icon">Key</span>
              <h4>Early Access</h4>
              <p>
                {isEbook
                  ? "Future draft previews are separate membership extras."
                  : "Chapter Two drafts as they develop."}
              </p>
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
