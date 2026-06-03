export function emailShell({
  title,
  body,
  ctaHref,
  ctaLabel,
  accent = "#f59e0b",
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
  accent?: string;
}) {
  return `
    <div style="margin:0;padding:40px 0;background:#0a0a0a;color:#e5e5e5;font-family:Georgia,'Times New Roman',serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px;background:#111;border:1px solid #2a2a2a;border-radius:8px;">
        <h1 style="margin:0 0 24px;color:${accent};font-size:28px;font-weight:400;">${title}</h1>
        <div style="font-size:16px;line-height:1.7;color:#d4d4d4;">${body}</div>
        ${
          ctaHref && ctaLabel
            ? `<p style="margin:28px 0;"><a href="${ctaHref}" style="display:inline-block;padding:14px 24px;border-radius:6px;background:${accent};color:#0a0a0a;text-decoration:none;font-weight:700;">${ctaLabel}</a></p>`
            : ""
        }
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:32px 0;" />
        <p style="margin:0;color:#737373;font-size:14px;">Every street remembers something.</p>
        <p style="margin:12px 0 0;color:#a3a3a3;">- Trevor</p>
      </div>
    </div>
  `;
}
