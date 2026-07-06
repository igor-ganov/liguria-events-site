const template = (link: string): string => `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#e07b1f">Dove Go</h2>
    <p>Click below to sign in. This link works once and expires in 5 minutes.</p>
    <p><a href="${link}" style="display:inline-block;background:#e07b1f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Sign in to Dove Go</a></p>
    <p style="color:#667">If you didn't request this, you can safely ignore this email.</p>
  </div>`;

/** Send the magic-link email via Resend. Returns false on non-2xx. */
export const sendMagicLink = async (
  apiKey: string,
  from: string,
  to: string,
  link: string,
): Promise<boolean> => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to, subject: 'Your Dove Go sign-in link', html: template(link) }),
  });
  return res.ok;
};
