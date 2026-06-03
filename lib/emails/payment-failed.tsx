import { APP_URL } from "@/lib/email";
import { emailShell } from "@/lib/emails/shell";

export function paymentFailedEmail({
  name = "Reader",
}: {
  name?: string | null;
}) {
  return emailShell({
    title: "Your light is flickering.",
    accent: "#ef4444",
    body: `
      <p>Hello ${name},</p>
      <p>Stripe could not process your latest membership payment. Your access may be interrupted if the payment is not recovered.</p>
      <p>You can update your payment method from your account page.</p>
    `,
    ctaHref: `${APP_URL}/account`,
    ctaLabel: "Manage Billing",
  });
}
