const esc = (s: string): string =>
  s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] ?? c);

const shell = (body: string): string =>
  `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto">
     <h2 style="color:#e07b1f">Dove Go</h2>${body}
     <p style="color:#667;font-size:13px">Questions? Write to public@dovego.it.</p>
   </div>`;

const message = (title: string, status: string, reason: string): { subject: string; html: string } => {
  const t = esc(title);
  if (status === 'published') {
    return {
      subject: 'Your event is live on Dove Go',
      html: shell(`<p>Good news — your event <strong>“${t}”</strong> passed review and is now published on Dove Go.</p><p>Thanks for contributing!</p>`),
    };
  }
  if (status === 'rejected') {
    return {
      subject: 'Your Dove Go submission wasn’t published',
      html: shell(
        `<p>Your event <strong>“${t}”</strong> wasn’t published because it conflicts with our <a href="https://dovego.it/content-policy">Content Policy</a>${reason ? `: ${esc(reason)}` : ''}.</p><p>If you believe this was a mistake, reply to this email.</p>`,
      ),
    };
  }
  return {
    subject: 'Your Dove Go submission is under review',
    html: shell(`<p>Thanks — your event <strong>“${t}”</strong> was received and is being reviewed. We’ll email you once it’s decided.</p>`),
  };
};

/** Email the submitter the outcome of AI moderation. */
export const sendModerationEmail = async (
  apiKey: string,
  from: string,
  to: string,
  title: string,
  status: string,
  reason: string,
): Promise<boolean> => {
  const { subject, html } = message(title, status, reason);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  return res.ok;
};
