import { APP_URL } from "@/lib/email";
import { emailShell } from "@/lib/emails/shell";

export function renewalEmail({ name = "Reader" }: { name?: string | null }) {
  return emailShell({
    title: "Streetlight stays alive.",
    body: `
      <p>Hello ${name},</p>
      <p>Your membership renewal was received. Thank you for keeping the street lit.</p>
    `,
    ctaHref: `${APP_URL}/community`,
    ctaLabel: "Explore Community",
  });
}
