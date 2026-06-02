import { APP_URL } from "@/lib/email";

const shell = ({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) => `
  <div style="margin:0;padding:40px 0;background:#0a0a0a;color:#e5e5e5;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px;background:#111;border:1px solid #2a2a2a;border-radius:8px;">
      <h1 style="margin:0 0 24px;color:#f59e0b;font-size:28px;font-weight:400;">${title}</h1>
      <div style="font-size:16px;line-height:1.7;color:#d4d4d4;">${body}</div>
      ${
        ctaHref && ctaLabel
          ? `<p style="margin:28px 0;"><a href="${ctaHref}" style="display:inline-block;padding:14px 24px;border-radius:6px;background:#f59e0b;color:#0a0a0a;text-decoration:none;font-weight:700;">${ctaLabel}</a></p>`
          : ""
      }
      <hr style="border:none;border-top:1px solid #2a2a2a;margin:32px 0;" />
      <p style="margin:0;color:#737373;font-size:14px;">Every street remembers something.</p>
      <p style="margin:12px 0 0;color:#a3a3a3;">- Trevor</p>
    </div>
  </div>
`;

export function welcomeEmail({
  name = "Reader",
  tier = "Supporter",
}: {
  name?: string | null;
  tier?: string | null;
}) {
  return shell({
    title: "You're in the light.",
    body: `
      <p>Hello ${name},</p>
      <p>Your ${tier} access is active. The rain keeps falling, but now you are not watching alone.</p>
      <p>You can start reading, visit your dashboard, and manage your membership from your account page.</p>
    `,
    ctaHref: `${APP_URL}/dashboard`,
    ctaLabel: "Open Dashboard",
  });
}

export function renewalEmail({ name = "Reader" }: { name?: string | null }) {
  return shell({
    title: "Streetlight stays alive.",
    body: `
      <p>Hello ${name},</p>
      <p>Your membership renewal was received. Thank you for keeping the street lit.</p>
    `,
    ctaHref: `${APP_URL}/community`,
    ctaLabel: "Explore Community",
  });
}

export function paymentFailedEmail({
  name = "Reader",
}: {
  name?: string | null;
}) {
  return shell({
    title: "Your light is flickering.",
    body: `
      <p>Hello ${name},</p>
      <p>Stripe could not process your latest membership payment. Your access may be interrupted if the payment is not recovered.</p>
      <p>You can update your payment method from your account page.</p>
    `,
    ctaHref: `${APP_URL}/account`,
    ctaLabel: "Manage Billing",
  });
}

export function cancellationEmail({
  name = "Reader",
}: {
  name?: string | null;
}) {
  return shell({
    title: "The door stays open.",
    body: `
      <p>Hello ${name},</p>
      <p>Your Streetlight membership was canceled. Chapter One stays free, and you can return whenever you want.</p>
    `,
    ctaHref: `${APP_URL}/checkout`,
    ctaLabel: "View Memberships",
  });
}
