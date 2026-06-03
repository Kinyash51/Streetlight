"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { pricing } from "@/lib/pricing";
import { supabase } from "@/lib/supabase-client";

type SuccessProduct = "ebook" | "supporter" | "patron";

type SuccessContentConfig = {
  headline: string;
  subheadline: string;
  icon: "book" | "star";
  steps: Array<{
    title: string;
    desc: string;
  }>;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
  unlocked: Array<{
    icon: string;
    title: string;
    desc: string;
  }>;
  footer: string;
};

function normalizeProduct(product: string | null): SuccessProduct {
  if (
    product === pricing.ebook.checkoutProduct ||
    product === pricing.supporter.checkoutProduct ||
    product === pricing.patron.checkoutProduct
  ) {
    return product;
  }

  return pricing.supporter.checkoutProduct;
}

function SuccessLoading() {
  return (
    <main className="success-page">
      <div className="success-loading">
        <div className="success-spinner" />
        <p>Confirming your purchase...</p>
      </div>
    </main>
  );
}

function SuccessIcon({ type }: { type: SuccessContentConfig["icon"] }) {
  if (type === "book") {
    return (
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }

  return (
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
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const product = normalizeProduct(searchParams.get("product"));
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [resolvedProduct, setResolvedProduct] = useState<SuccessProduct>(product);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setResolvedProduct(product);
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
          setResolvedProduct(normalizeProduct(sub.tier));
        } else {
          setResolvedProduct(product);
        }

        setStatus("success");
      } catch {
        setResolvedProduct(product);
        setStatus("success");
      }
    };

    checkSession();
  }, [product]);

  const content = useMemo<Record<SuccessProduct, SuccessContentConfig>>(
    () => ({
      ebook: {
        headline: "Your book is ready.",
        subheadline: `Your ${pricing.ebook.price} eBook purchase is ready.`,
        icon: "book",
        steps: [
          {
            title: "Check your email",
            desc: "Your receipt is on the way.",
          },
          {
            title: "Start reading",
            desc: "Open the reader and begin The Drowned Streetlamp.",
          },
          {
            title: "Keep your copy",
            desc: "This is a one-time purchase, not a subscription.",
          },
        ],
        primaryCta: { text: "Start Reading", href: "/book" },
        secondaryCta: { text: "Go to Dashboard", href: "/dashboard" },
        unlocked: [
          {
            icon: "Read",
            title: "Full eBook",
            desc: "The Drowned Streetlamp is ready in your reader.",
          },
          {
            icon: "Own",
            title: "One-Time Purchase",
            desc: "Yours without a monthly charge.",
          },
          {
            icon: "Life",
            title: "Lifetime Access",
            desc: "Return to the story from your account.",
          },
          {
            icon: "Talk",
            title: "Community",
            desc: "Discuss theories and lore with other readers.",
          },
        ],
        footer:
          "Every street remembers something. Thank you for remembering this one.",
      },
      supporter: {
        headline: "You're in the light.",
        subheadline: "Welcome, Supporter.",
        icon: "star",
        steps: [
          {
            title: "Check your email",
            desc: "We sent a welcome note with your membership details.",
          },
          {
            title: "Start reading",
            desc: "The reader is ready. Pick up where you left off.",
          },
          {
            title: "Explore the extras",
            desc: "Behind-the-scenes notes, early drafts, and community access.",
          },
        ],
        primaryCta: { text: "Start Reading", href: "/book" },
        secondaryCta: { text: "Go to Dashboard", href: "/dashboard" },
        unlocked: [
          {
            icon: "Read",
            title: "Reader Access",
            desc: "The Drowned Streetlamp is ready in your reader.",
          },
          {
            icon: "Notes",
            title: "Behind the Scenes",
            desc: "Notes on Elias, the rain, and the city.",
          },
          {
            icon: "Early",
            title: "Early Access",
            desc: "Chapter Two drafts as they develop.",
          },
          {
            icon: "Talk",
            title: "Community",
            desc: "Discuss theories and lore with other readers.",
          },
        ],
        footer:
          "Every street remembers something. Thank you for remembering this one.",
      },
      patron: {
        headline: "You're in the light.",
        subheadline: "Welcome, Patron.",
        icon: "star",
        steps: [
          {
            title: "Check your email",
            desc: "Your Patron welcome note is on the way.",
          },
          {
            title: "Go to your dashboard",
            desc: "Your highest-tier access appears in your account.",
          },
          {
            title: "Shape the story",
            desc: "Future patron extras and credits will live here as they open.",
          },
        ],
        primaryCta: { text: "Go to Dashboard", href: "/dashboard" },
        secondaryCta: { text: "Start Reading", href: "/book" },
        unlocked: [
          {
            icon: "Top",
            title: "Patron Status",
            desc: "Highest tier. Exclusive access.",
          },
          {
            icon: "All",
            title: "Everything",
            desc: "Reader access plus supporter extras.",
          },
          {
            icon: "Live",
            title: "Future Live Reads",
            desc: "Planned read-aloud sessions and Q&A.",
          },
          {
            icon: "Name",
            title: "Credit Plans",
            desc: "Patron acknowledgements are planned for future releases.",
          },
        ],
        footer:
          "The city remembers its patrons. Thank you for keeping the light on.",
      },
    }),
    []
  );

  if (status === "loading") {
    return <SuccessLoading />;
  }

  const current = content[resolvedProduct];
  const tierColor =
    resolvedProduct === pricing.patron.checkoutProduct
      ? "patron"
      : resolvedProduct === pricing.ebook.checkoutProduct
        ? "reader"
        : "supporter";

  return (
    <main className="success-page">
      <div className="success-container">
        <div className="success-celebration">
          <div className="success-icon">
            <SuccessIcon type={current.icon} />
          </div>
          <h1>{current.headline}</h1>
          <p className={`success-tier ${tierColor}`}>{current.subheadline}</p>
        </div>

        <div className="success-next">
          <h2>What happens next</h2>
          <div className="success-steps">
            {current.steps.map((step, index) => (
              <div className="success-step" key={step.title}>
                <span className="step-number">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="success-actions">
          <Link href={current.primaryCta.href} className="btn-primary btn-large">
            {current.primaryCta.text}
          </Link>
          <Link href={current.secondaryCta.href} className="btn-ghost btn-large">
            {current.secondaryCta.text}
          </Link>
        </div>

        <div className="success-preview">
          <h2>What you unlocked</h2>
          <div className="preview-grid">
            {current.unlocked.map((item) => (
              <div className="preview-item" key={item.title}>
                <span className="preview-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="success-footer">
          <p>
            Questions?{" "}
            <Link href="mailto:hello@streetlightstory.site">
              hello@streetlightstory.site
            </Link>
          </p>
          <p className="success-thanks">{current.footer}</p>
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
