import Link from "next/link";
import { pricing } from "@/lib/pricing";

export default function Page() {
  return (
    <main className="checkout-page">
      <section className="page-hero">
        <p className="section-tag">Checkout</p>
        <h1>Choose your Streetlight access.</h1>
        <p>
          Buy the eBook once, read free, or support the Streetlight universe
          monthly.
        </p>
      </section>

      <section className="tiers-section">
        <div className="tiers-grid">
          <div className="tier-card">
            <h3>{pricing.freeReader.name}</h3>
            <div className="tier-price">{pricing.freeReader.price}</div>
            <ul>
              <li>✓ Chapter One access</li>
              <li>✓ Community updates</li>
              <li>✓ No payment required</li>
            </ul>
            <Link href="/read" className="btn-primary">
              Start Reading
            </Link>
          </div>

          <div className="tier-card featured">
            <span className="tier-badge">One-Time</span>
            <h3>{pricing.ebook.name}</h3>
            <div className="tier-price">
              {pricing.ebook.price} {pricing.ebook.billing}
            </div>
            <ul>
              <li>✓ Full eBook access</li>
              <li>✓ One-time purchase</li>
              <li>✓ Not a subscription</li>
            </ul>
            <Link href={pricing.ebook.href} className="btn-primary">
              Buy eBook
            </Link>
          </div>

          <div className="tier-card">
            <h3>{pricing.supporter.name}</h3>
            <div className="tier-price">{pricing.supporter.price}</div>
            <ul>
              <li>✓ Recurring monthly membership</li>
              <li>✓ Early chapter previews</li>
              <li>✓ Behind-the-scenes notes</li>
            </ul>
            <Link href={pricing.supporter.href} className="btn-primary">
              Become a Supporter
            </Link>
          </div>

          <div className="tier-card">
            <span className="tier-badge">Coming Soon</span>
            <h3>{pricing.patron.name}</h3>
            <div className="tier-price">{pricing.patron.price}</div>
            <ul>
              <li>✓ Recurring monthly membership</li>
              <li>✓ Bonus stories</li>
              <li>✓ Future patron-only extras</li>
            </ul>
            <form action="/api/checkout" method="post">
              <input type="hidden" name="product" value={pricing.patron.checkoutProduct} />
              <button type="submit" className="btn-primary">
                Become a Patron
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
