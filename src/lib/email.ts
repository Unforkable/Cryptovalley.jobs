const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cryptovalley.jobs";

const FROM_EMAIL =
  process.env.ALERT_FROM_EMAIL ?? "CryptoValley.jobs <alerts@cryptovalley.jobs>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail({
  to,
  ...content
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], ...content }),
  });
  if (!res.ok) {
    console.error("Resend send failed:", res.status, await res.text());
  }
  return res.ok;
}

export function confirmationEmail(token: string): {
  subject: string;
  html: string;
  text: string;
} {
  const confirmUrl = `${BASE_URL}/api/confirm?token=${token}`;
  return {
    subject: "Confirm your job alerts — CryptoValley.jobs",
    html: `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="font-size:18px;font-weight:800;margin-bottom:14px;">
      <span style="color:#4f46e5;">Crypto</span>Valley<span style="color:#64748b;">.jobs</span>
    </div>
    <h1 style="font-size:20px;margin:0 0 8px;">Confirm your subscription</h1>
    <p style="font-size:14px;color:#475569;margin:0 0 20px;">
      Click below to start receiving alerts when new blockchain and crypto jobs
      are posted in Switzerland's Crypto Valley.
    </p>
    <a href="${confirmUrl}"
       style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:14px;font-weight:600;padding:10px 22px;border-radius:10px;text-decoration:none;">
      Confirm subscription
    </a>
    <p style="margin-top:24px;font-size:12px;color:#94a3b8;">
      If you didn't subscribe on CryptoValley.jobs, you can ignore this email.
    </p>
  </div>
</body></html>`,
    text: `Confirm your CryptoValley.jobs job alerts subscription:\n\n${confirmUrl}\n\nIf you didn't subscribe, ignore this email.`,
  };
}
