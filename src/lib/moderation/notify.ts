import { moderationMessage } from './moderation-message.ts';

/** Email the submitter the outcome of AI moderation. */
export const sendModerationEmail = async (
  apiKey: string,
  from: string,
  to: string,
  title: string,
  status: string,
  reason: string,
): Promise<boolean> => {
  const { subject, html } = moderationMessage(title, status, reason);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  return res.ok;
};
