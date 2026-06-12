import Link from "next/link";
import { pricing } from "@/lib/pricing";
import TrustBadges, { CheckoutTrustNote } from "@/components/TrustBadges";

export default function Page() {
  return (
    <main className="checkout-page refined-checkout">
      <section className="checkout-hero">
        <p className="section-tag">Checkout</p>
        <h1>Read the story. Support the world around it.</h1>
        <p>
          Start free today. Paid access is temporarily paused while Streetlight
          moves to a new payment system.
        </p>
      </section>

      <section className="checkout-shell" aria-label="Streetlight checkout options">
        <article className="checkout-product">
          <div className="checkout-product-copy">
            <span className="tier-badge">One-Time</span>
            <p className="reader-kicker">Featured Product</p>
            <h2>{pricing.ebook.name}</h2>
            <p>
              Own the full eBook with a single purchase. This is not a
              subscription. Purchasing will reopen after the new payment
              connection is ready.
            </p>
            <div className="instant-access-note">
              <span aria-hidden="true" />
              <strong>Payment upgrade in progress</strong>
            </div>
          </div>

          <div className="checkout-price-box">
            <span>{pricing.ebook.billing}</span>
            <strong>{pricing.ebook.price}</strong>
            <span className="btn-primary checkout-disabled" aria-disabled="true">
              Payments temporarily unavailable
            </span>
            <TrustBadges />
            <CheckoutTrustNote />
          </div>
        </article>

        <div className="checkout-secondary-grid">
          <article className="checkout-card">
            <p className="reader-kicker">Read Free</p>
            <h3>{pricing.freeReader.name}</h3>
            <div className="tier-price">{pricing.freeReader.price}</div>
            <p>
              Chapter One access, public updates, and a clean way into the
              Streetlight world.
            </p>
            <Link href="/read/chapter-one" className="btn-ghost">
              Start Reading
            </Link>
          </article>

          <article className="checkout-card supporter-card">
            <p className="reader-kicker">Support Monthly</p>
            <h3>{pricing.supporter.name}</h3>
            <div className="tier-price">{pricing.supporter.price}</div>
            <p>
              A recurring monthly membership for early previews and behind the
              scenes notes.
            </p>
            <span className="btn-primary checkout-disabled" aria-disabled="true">
              Payments temporarily unavailable
            </span>
          </article>

          <article className="checkout-card">
            <span className="tier-badge">Coming Soon</span>
            <p className="reader-kicker">Deeper Support</p>
            <h3>{pricing.patron.name}</h3>
            <div className="tier-price">{pricing.patron.price}</div>
            <p>
              A recurring monthly patron tier for future bonus stories and
              patron-only extras.
            </p>
            <span className="btn-ghost checkout-disabled">Coming Soon</span>
          </article>
        </div>
      </section>
    </main>
  );
}
