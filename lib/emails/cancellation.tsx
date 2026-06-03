import { APP_URL } from "@/lib/email";
import { emailShell } from "@/lib/emails/shell";

export function cancellationEmail({
  name = "Reader",
}: {
  name?: string | null;
}) {
  return emailShell({
    title: "The door stays open.",
    accent: "#a3a3a3",
    body: `
      <p>Hello ${name},</p>
      <p>Your Streetlight membership was canceled. Chapter One stays free, and you can return whenever you want.</p>
    `,
    ctaHref: `${APP_URL}/checkout`,
    ctaLabel: "View Memberships",
  });
}
