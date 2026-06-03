import { APP_URL } from "@/lib/email";
import { emailShell } from "@/lib/emails/shell";

export function welcomeEmail({
  name = "Reader",
  tier = "Supporter",
}: {
  name?: string | null;
  tier?: string | null;
}) {
  return emailShell({
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
