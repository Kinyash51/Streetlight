export default function TrustBadges() {
  return (
    <div className="trust-badges" aria-label="Checkout trust details">
      <div className="trust-badge">
        <span aria-hidden="true">Lock</span>
        <strong>Secure Stripe checkout</strong>
      </div>
      <div className="trust-badge">
        <span aria-hidden="true">Now</span>
        <strong>Instant access after purchase</strong>
      </div>
      <div className="trust-badge">
        <span aria-hidden="true">Once</span>
        <strong>eBook is a one-time purchase</strong>
      </div>
    </div>
  );
}

export function CheckoutTrustNote() {
  return (
    <p className="checkout-trust-note">
      Payments are handled securely by Stripe. Supporter is monthly; the eBook
      is charged once.
    </p>
  );
}
