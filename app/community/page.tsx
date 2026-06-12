"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { pricing } from "@/lib/pricing";

type Tier = {
  name: string;
  price: string;
  badge?: string;
  description: string;
  benefits: string[];
  cta: string;
  href?: string;
  featured?: boolean;
  disabled?: boolean;
};

type PreviewItem = {
  title: string;
  type: "chapter" | "note" | "extra";
  locked: boolean;
  teaser: string;
};

const tiers: Tier[] = [
  {
    name: pricing.freeReader.name,
    price: pricing.freeReader.price,
    description: "Start here. No commitment, no card, no account required.",
    benefits: [
      "Chapter One access",
      "Universe lore entries",
      "Public updates",
      "Community announcements",
      "No account needed to read",
    ],
    cta: "Start Reading",
    href: "/read/chapter-one",
  },
  {
    name: pricing.supporter.name,
    price: pricing.supporter.price,
    badge: "Most Popular",
    description: "For readers who want to support future Streetlight chapters.",
    benefits: [
      "Recurring monthly membership",
      "Support future Streetlight stories",
      "Early chapter previews when available",
      "Behind-the-scenes notes",
      "Supporter updates",
    ],
    cta: "Become a Supporter",
    featured: true,
    disabled: true,
  },
  {
    name: pricing.patron.name,
    price: pricing.patron.price,
    badge: "Coming Soon",
    description: "A higher support tier planned for deeper extras and bonus material.",
    benefits: [
      "Recurring monthly membership",
      "Bonus story plans",
      "Future patron-only extras",
      "Acknowledgement options",
      "Private update plans",
    ],
    cta: "Coming Soon",
    disabled: true,
  },
];

const previewContent: PreviewItem[] = [
  {
    title: "Chapter One: The Drowned Streetlamp",
    type: "chapter",
    locked: false,
    teaser: "The rain had been falling for three days when Elias first saw the drowned streetlamp.",
  },
  {
    title: "Chapter Two: The Underground",
    type: "chapter",
    locked: true,
    teaser:
      "Elias descends for the first time. The stairs go deeper than they should.",
  },
  {
    title: "Behind the Rain",
    type: "note",
    locked: true,
    teaser:
      "Notes on how the rain became more than atmosphere inside the story.",
  },
  {
    title: "City Files",
    type: "extra",
    locked: true,
    teaser:
      "Short lore drops, character notes, and fragments from the Streetlight world.",
  },
];

const faqs = [
  {
    q: "What do I get as a free reader?",
    a: "You can read Chapter One, explore public universe lore, and follow public updates without paying or creating an account.",
  },
  {
    q: "What is the Supporter tier?",
    a: `Supporter is ${pricing.supporter.price}. It is a recurring monthly membership for readers who want to support future chapters and get supporter updates as the platform grows.`,
  },
  {
    q: "Is The Drowned Streetlamp eBook a subscription?",
    a: `No. The eBook is ${pricing.ebook.price} as a one-time purchase. Memberships are separate monthly support tiers.`,
  },
  {
    q: "Can I cancel a membership?",
    a: "Yes. Membership controls will return when the new payment connection is ready.",
  },
  {
    q: "Is Patron live?",
    a: "Not yet. The Patron price is listed so the structure is clear, but the tier is intentionally marked Coming Soon.",
  },
];

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  return (
    <motion.article
      className={`tier-card ${tier.featured ? "featured" : ""} ${
        tier.disabled ? "coming-soon" : ""
      }`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      {tier.badge ? (
        <span className={`tier-badge ${tier.featured ? "featured-badge" : ""}`}>
          {tier.badge}
        </span>
      ) : null}

      <div className="tier-header">
        <h3>{tier.name}</h3>
        <div className="tier-price">
          <strong>{tier.price}</strong>
        </div>
        <p className="tier-desc">{tier.description}</p>
      </div>

      <ul className="tier-benefits">
        {tier.benefits.map((benefit) => (
          <li key={benefit}>
            <span aria-hidden="true">Included</span>
            {benefit}
          </li>
        ))}
      </ul>

      {tier.href && !tier.disabled ? (
        <Link
          href={tier.href}
          className={`btn-primary tier-cta ${tier.featured ? "" : "btn-ghost"}`}
        >
          {tier.cta}
        </Link>
      ) : (
        <button type="button" className="btn-primary tier-cta" disabled>
          {tier.cta}
        </button>
      )}
    </motion.article>
  );
}

function PreviewCard({ item }: { item: PreviewItem }) {
  const typeLabels = {
    chapter: "Chapter",
    note: "Note",
    extra: "Extra",
  };

  return (
    <article className={`preview-card ${item.locked ? "locked" : "unlocked"}`}>
      <div className="preview-card-header">
        <span className={`preview-type preview-type-${item.type}`}>
          {typeLabels[item.type]}
        </span>
        {item.locked ? (
          <span className="preview-lock">Supporter preview</span>
        ) : (
          <span className="preview-free">Free</span>
        )}
      </div>
      <h3>{item.title}</h3>
      <p>{item.teaser}</p>
      {item.locked ? (
        <div className="preview-lock-overlay">Unlock plan coming soon</div>
      ) : null}
    </article>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button
        type="button"
        className="faq-question"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span aria-hidden="true">{open ? "Close" : "Open"}</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <p>{a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"preview" | "compare">("preview");

  return (
    <main className="community-page">
      <section className="community-hero">
        <FadeIn>
          <p className="section-tag">Community</p>
          <h1>Join the Streetlight Universe</h1>
          <p>Read free, support the book, or go deeper as the universe grows.</p>

          <div className="community-status-strip">
            <span>Chapter One live</span>
            <span>Payments updating</span>
            <span>Patron planned</span>
          </div>
        </FadeIn>
      </section>

      <section className="tiers-section">
        <FadeIn>
          <div className="section-head">
            <p className="section-tag">Membership</p>
            <h2>Choose how you read.</h2>
            <p>
              Start free. Upgrade when you want to support the story and future
              extras.
            </p>
          </div>
        </FadeIn>

        <div className="tiers-grid">
          {tiers.map((tier, index) => (
            <TierCard key={tier.name} tier={tier} index={index} />
          ))}
        </div>
      </section>

      <section className="preview-section">
        <div className="preview-inner">
          <FadeIn>
            <div className="preview-header">
              <div>
                <p className="section-tag">Preview</p>
                <h2>What opens next.</h2>
              </div>
              <div className="preview-tabs">
                <button
                  type="button"
                  className={activeTab === "preview" ? "active" : ""}
                  onClick={() => setActiveTab("preview")}
                >
                  Content
                </button>
                <button
                  type="button"
                  className={activeTab === "compare" ? "active" : ""}
                  onClick={() => setActiveTab("compare")}
                >
                  Compare
                </button>
              </div>
            </div>
          </FadeIn>

          <AnimatePresence mode="wait">
            {activeTab === "preview" ? (
              <motion.div
                key="preview"
                className="preview-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                {previewContent.map((item) => (
                  <PreviewCard key={item.title} item={item} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="compare"
                className="compare-table"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Free</th>
                      <th className="featured-col">Supporter</th>
                      <th>Patron</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Chapter One</td>
                      <td>Included</td>
                      <td className="featured-col">Included</td>
                      <td>Included</td>
                    </tr>
                    <tr>
                      <td>Universe lore</td>
                      <td>Public files</td>
                      <td className="featured-col">Public files</td>
                      <td>Expanded plan</td>
                    </tr>
                    <tr>
                      <td>Membership</td>
                      <td>$0</td>
                      <td className="featured-col">{pricing.supporter.price}</td>
                      <td>{pricing.patron.price}</td>
                    </tr>
                    <tr>
                      <td>eBook</td>
                      <td>Separate {pricing.ebook.price} purchase</td>
                      <td className="featured-col">Support plan</td>
                      <td>Coming soon</td>
                    </tr>
                    <tr>
                      <td>Future extras</td>
                      <td>Public updates</td>
                      <td className="featured-col">Supporter updates</td>
                      <td>Patron extras planned</td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-inner">
          <FadeIn>
            <p className="section-tag">FAQ</p>
            <h2>Questions?</h2>
          </FadeIn>
          <div className="faq-list">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="community-final-cta">
        <div className="community-final-inner">
          <h2>Still deciding?</h2>
          <p>Start with Chapter One. It is free, complete, and needs no account.</p>
          <Link href="/read/chapter-one" className="btn-primary">
            Read Chapter One Free
          </Link>
          <p className="community-final-note">No credit card. No signup. Just the story.</p>
        </div>
      </section>
    </main>
  );
}
