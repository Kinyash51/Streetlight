export default function TrustBadges() {
  return (
    <div className="trust-badges" aria-label="Checkout trust details">
      <div className="trust-badge">
        <span aria-hidden="true">Soon</span>
        <strong>New payment connection in progress</strong>
      </div>
      <div className="trust-badge">
        <span aria-hidden="true">Now</span>
        <strong>Access will connect to your reader account</strong>
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
      Paid checkout is temporarily paused. Free Chapter One remains available.
    </p>
  );
}
