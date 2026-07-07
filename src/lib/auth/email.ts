const template = (link: string, code: string): string => `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
    <h2 style="color:#e07b1f">Dove Go</h2>
    <p>Sign in to Dove Go — click the button, or enter this code on the page:</p>
    <p style="font-size:30px;font-weight:800;letter-spacing:6px;margin:8px 0">${code}</p>
    <p><a href="${link}" style="display:inline-block;background:#e07b1f;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Sign in to Dove Go</a></p>
    <p style="color:#667">Both work once and expire in 5 minutes. If you didn't request this, ignore this email.</p>
  </div>`;

/** Send the magic-link + code email via Resend. Returns false on non-2xx. */
export const sendMagicLink = async (
  apiKey: string,
  from: string,
  to: string,
  link: string,
  code: string,
): Promise<boolean> => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to, subject: 'Your Dove Go sign-in link & code', html: template(link, code) }),
  });
  return res.ok;
};
