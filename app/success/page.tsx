"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

type SuccessProduct = "ebook" | "supporter" | "patron";

function normalizeProduct(value: string | null | undefined): SuccessProduct {
  return value === "ebook" || value === "supporter" || value === "patron"
    ? value
    : "supporter";
}

function SuccessLoading() {
  return (
    <div className="success-page">
      <div className="success-loading">
        <div className="success-spinner" />
        <p>Confirming your purchase...</p>
      </div>
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const product = normalizeProduct(searchParams.get("product"));

  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [tier, setTier] = useState<SuccessProduct>(product);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setTier(product);
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

        if (sub?.status === "active") {
          setTier(normalizeProduct(sub.tier));
        } else {
          setTier(product);
        }

        setStatus("success");
      } catch {
        setTier(product);
        setStatus("success");
      }
    };

    checkSession();
  }, [product]);

  if (status === "loading") {
    return <SuccessLoading />;
  }

  // Product-specific content
  const content = {
    ebook: {
      headline: "Your book is ready.",
      subheadline: "Welcome, Reader.",
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      ),
      steps: [
        { title: "Check your email", desc: "Your receipt and download link are on the way." },
        { title: "Start reading", desc: "The full eBook is unlocked in your dashboard." },
        { title: "Read offline", desc: "Download the PDF for reading without internet." },
      ],
      primaryCta: { text: "Start Reading", href: "/book", icon: "book" },
      secondaryCta: { text: "Go to Dashboard", href: "/dashboard", icon: "dashboard" },
      unlocked: [
        { icon: "📖", title: "Full eBook", desc: "The Drowned Streetlamp — 28,000 words." },
        { icon: "📥", title: "Download", desc: "PDF and EPUB formats for offline reading." },
        { icon: "♾️", title: "Lifetime Access", desc: "Yours forever. No subscription needed." },
        { icon: "💬", title: "Community", desc: "Join discussions with other readers." },
      ],
      footer: "Every street remembers something. Thank you for remembering this one.",
    },
    supporter: {
      headline: "You're in the light.",
      subheadline: "Welcome, Supporter.",
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      ),
      steps: [
        { title: "Check your email", desc: "We sent a welcome note with your membership details." },
        { title: "Start reading", desc: "The full eBook is unlocked. Pick up where you left off." },
        { title: "Explore the extras", desc: "Behind-the-scenes notes, early drafts, and community access." },
      ],
      primaryCta: { text: "Start Reading", href: "/book", icon: "book" },
      secondaryCta: { text: "Go to Dashboard", href: "/dashboard", icon: "dashboard" },
      unlocked: [
        { icon: "📖", title: "Full eBook", desc: "The Drowned Streetlamp — all 28,000 words." },
        { icon: "📝", title: "Behind the Scenes", desc: "Notes on Elias, the rain, and the city." },
        { icon: "🗝️", title: "Early Access", desc: "Chapter Two drafts as they develop." },
        { icon: "💬", title: "Community", desc: "Discuss theories and lore with other readers." },
      ],
      footer: "Every street remembers something. Thank you for remembering this one.",
    },
    patron: {
      headline: "You're in the light.",
      subheadline: "Welcome, Patron.",
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      ),
      steps: [
        { title: "Check your email", desc: "Your Patron welcome kit is on the way." },
        { title: "Join the inner circle", desc: "Monthly live reads and direct access to Trevor." },
        { title: "Shape the story", desc: "Your name in credits and input on future chapters." },
      ],
      primaryCta: { text: "Enter the Patron Lounge", href: "/dashboard", icon: "dashboard" },
      secondaryCta: { text: "Start Reading", href: "/book", icon: "book" },
      unlocked: [
        { icon: "👑", title: "Patron Status", desc: "Highest tier. Exclusive access." },
        { icon: "📖", title: "Everything", desc: "Full eBook + all supporter extras." },
        { icon: "🎤", title: "Monthly Live Reads", desc: "Read-aloud sessions with Q&A." },
        { icon: "✍️", title: "Name in Credits", desc: "Listed as a patron in the published book." },
      ],
      footer: "The city remembers its patrons. Thank you for keeping the light on.",
    },
  };

  const c = content[tier];
  const tierColor = tier === "patron" ? "patron" : tier === "ebook" ? "reader" : "supporter";

  return (
    <div className="success-page">
      <div className="success-container">
        {/* Celebration */}
        <div className="success-celebration">
          <div className="success-icon">{c.icon}</div>
          <h1>{c.headline}</h1>
          <p className={`success-tier ${tierColor}`}>{c.subheadline}</p>
        </div>

        {/* Steps */}
        <div className="success-next">
          <h2>What happens next</h2>
          <div className="success-steps">
            {c.steps.map((step, i) => (
              <div className="success-step" key={i}>
                <span className="step-number">{i + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="success-actions">
          <Link href={c.primaryCta.href} className="btn-primary btn-large">
            {c.primaryCta.text}
          </Link>
          <Link href={c.secondaryCta.href} className="btn-ghost btn-large">
            {c.secondaryCta.text}
          </Link>
        </div>

        {/* Unlocked */}
        <div className="success-preview">
          <h2>What you unlocked</h2>
          <div className="preview-grid">
            {c.unlocked.map((item, i) => (
              <div className="preview-item" key={i}>
                <span className="preview-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="success-footer">
          <p>Questions? <Link href="mailto:hello@streetlightstory.site">hello@streetlightstory.site</Link></p>
          <p className="success-thanks">{c.footer}</p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}
