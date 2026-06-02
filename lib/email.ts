export const APP_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.APP_URL ??
  "https://streetlightstory.site";

const fromEmail = process.env.FROM_EMAIL ?? "hello@streetlightstory.site";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { success: false, skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Streetlight <${fromEmail}>`,
      to,
      subject,
      html,
    }),
  });

  const data = (await response.json().catch(() => null)) as {
    id?: string;
    message?: string;
  } | null;

  if (!response.ok) {
    return {
      success: false,
      error: data?.message ?? "Email request failed.",
    };
  }

  return { success: true, id: data?.id };
}
