import { APP_URL } from "@/lib/email";
import { emailShell } from "@/lib/emails/shell";

export function winbackEmail({
  name = "Reader",
}: {
  name?: string | null;
}) {
  return emailShell({
    title: "The street remembers you.",
    body: `
      <p>Hello ${name},</p>
      <p>It has been a little while since your light went out.</p>
      <p>Chapter One is still free, the city is still waiting, and you can rejoin the Streetlight community whenever you are ready.</p>
    `,
    ctaHref: `${APP_URL}/checkout`,
    ctaLabel: "Return to Streetlight",
  });
}
