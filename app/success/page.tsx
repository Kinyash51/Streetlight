"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { pricing } from "@/lib/pricing";

type SyncStatus = "loading" | "ready";
type PurchaseKind = "ebook" | "supporter" | "patron" | "unknown";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<SyncStatus>("loading");
  const [purchaseKind, setPurchaseKind] = useState<PurchaseKind>("unknown");

  useEffect(() => {
    let stopped = false;
    let attempts = 0;

    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("ready");
        return;
      }

      const [{ data: orders }, { data: subscriptions }] = await Promise.all([
        supabase
          .from("orders")
          .select("product, status")
          .eq("user_id", user.id)
          .eq("product", pricing.ebook.checkoutProduct)
          .eq("status", "paid"),
        supabase
          .from("subscriptions")
          .select("tier, status")
          .eq("user_id", user.id)
          .in("status", ["active", "trialing"]),
      ]);

      const subscription = subscriptions?.find(
        (item) =>
          item.tier === pricing.supporter.checkoutProduct ||
          item.tier === pricing.patron.checkoutProduct
      );

      if (subscription?.tier === pricing.patron.checkoutProduct) {
        setPurchaseKind("patron");
        setStatus("ready");
        return;
      }

      if (subscription?.tier === pricing.supporter.checkoutProduct) {
        setPurchaseKind("supporter");
        setStatus("ready");
        return;
      }

      if (orders?.length) {
        setPurchaseKind("ebook");
        setStatus("ready");
        return;
      }

      attempts += 1;

      if (attempts >= 8 || !sessionId) {
        setStatus("ready");
        return;
      }

      window.setTimeout(() => {
        if (!stopped) {
          checkAccess();
        }
      }, 1000);
    }

    checkAccess();

    return () => {
      stopped = true;
    };
  }, [sessionId]);

  if (status === "loading") {
    return (
      <main className="success-page success-experience">
        <section className="success-shell success-shell-centered">
          <div className="success-copy">
            <p className="section-tag">Payment Successful</p>
            <h1>Confirming your access...</h1>
            <p>
              Stripe has sent you back to Streetlight. The webhook may need a
              moment to sync your reader access.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const label =
    purchaseKind === "ebook"
      ? "eBook purchase"
      : purchaseKind === "patron"
        ? "Patron membership"
        : purchaseKind === "supporter"
          ? "Supporter membership"
          : "Streetlight access";

  return (
    <main className="success-page success-experience">
      <section className="success-shell">
        <div className="success-glow" aria-hidden="true" />

        <div className="success-copy">
          <p className="section-tag">Payment Successful</p>
          <h1>You&apos;re in the light.</h1>
          <p>
            Your {label} is being connected to your Streetlight account. Head to
            your dashboard to see the latest access state.
          </p>

          <div className="success-actions">
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
            <Link href="/read/chapter-one" className="btn-ghost">
              Start Reading
            </Link>
          </div>
        </div>

        <aside className="success-panel" aria-label="Purchase next steps">
          <p className="reader-kicker">What happens next</p>
          <div className="success-status">
            <span>Receipt</span>
            <strong>Complete</strong>
          </div>
          <div className="success-status">
            <span>Dashboard</span>
            <strong>Ready</strong>
          </div>
          <div className="success-status">
            <span>Access Sync</span>
            <strong>Automatic</strong>
          </div>

          <Link href="/account" className="success-download">
            Manage Account
          </Link>
          <small>
            If your dashboard does not update instantly, wait a few seconds and
            refresh. Stripe webhooks sometimes arrive after the success redirect.
          </small>
        </aside>
      </section>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="success-page success-experience">
          <section className="success-shell success-shell-centered">
            <div className="success-copy">
              <h1>Loading receipt...</h1>
            </div>
          </section>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
