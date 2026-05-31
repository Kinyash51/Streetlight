import Link from "next/link";

const tiers = [
  {
    name: "Free Reader",
    price: "Free",
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
    name: "Supporter",
    price: "$4.99",
    badge: "Most Popular",
    benefits: [
      "Full eBook access",
      "Early chapter previews",
      "Behind-the-scenes notes",
      "Support future Streetlight stories",
    ],
    href: "https://buy.stripe.com/test_7sYfZjafA8VsbyF3l37kc02",
    cta: "Become a Supporter",
  },
  {
    name: "Patron",
    price: "$9.99",
    badge: "Coming Soon",
    benefits: [
      "Bonus stories",
      "Name in acknowledgements",
      "Private updates",
      "Future patron-only extras",
    ],
    href: "/community",
    cta: "Coming Soon",
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
                tier.name === "Supporter" ? "featured" : ""
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

              <Link href={tier.href} className="btn-primary">
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}