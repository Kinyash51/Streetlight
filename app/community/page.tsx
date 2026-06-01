import Link from "next/link";
import { pricing } from "@/lib/pricing";

const tiers = [
  {
    name: pricing.freeReader.name,
    price: pricing.freeReader.price,
    badge: "",
    benefits: [
      "Chapter One access",
      "Universe lore drops",
      "Community updates",
      "No account needed",
    ],
    href: "/read",
    cta: "Start Reading",
  },
  {
    name: pricing.supporter.name,
    price: pricing.supporter.price,
    badge: "Most Popular",
    benefits: [
      "Recurring monthly membership",
      "Full eBook access",
      "Early chapter previews",
      "Behind-the-scenes notes",
      "Support future Streetlight stories",
    ],
    href: pricing.supporter.href,
    cta: "Become a Supporter",
  },
  {
    name: pricing.patron.name,
    price: pricing.patron.price,
    badge: "Coming Soon",
    benefits: [
      "Recurring monthly membership",
      "Bonus stories",
      "Name in acknowledgements",
      "Private updates",
      "Future patron-only extras",
    ],
    checkoutProduct: pricing.patron.checkoutProduct,
    cta: "Become a Patron",
  },
];

export default function CommunityPage() {
  return (
    <main className="community-page">
      <section className="page-hero">
        <p className="section-tag">Community</p>
        <h1>Join the Streetlight Universe</h1>
        <p>
          Read free, support the book, or go deeper as the universe grows.
        </p>
      </section>

      <section className="tiers-section">
        <div className="section-head">
          <p className="section-tag">Membership</p>
          <h2>Choose how you read.</h2>
          <p>
            Start free. Upgrade when you want the full story and future extras.
          </p>
        </div>

        <div className="tiers-grid">
          {tiers.map((tier) => (
            <div
              className={`tier-card ${
                tier.name === pricing.supporter.name ? "featured" : ""
              }`}
              key={tier.name}
            >
              {tier.badge && <span className="tier-badge">{tier.badge}</span>}

              <h3>{tier.name}</h3>
              <div className="tier-price">{tier.price}</div>

              <ul>
                {tier.benefits.map((benefit) => (
                  <li key={benefit}>✓ {benefit}</li>
                ))}
              </ul>

              {"checkoutProduct" in tier ? (
                <form action="/api/checkout" method="post">
                  <input
                    type="hidden"
                    name="product"
                    value={tier.checkoutProduct}
                  />
                  <button type="submit" className="btn-primary">
                    {tier.cta}
                  </button>
                </form>
              ) : (
                <Link href={tier.href} className="btn-primary">
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
