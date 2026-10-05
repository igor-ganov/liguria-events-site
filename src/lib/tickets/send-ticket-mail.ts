import type { TicketMail } from './ticket-mail.ts';

export type MailEnv = Readonly<{ RESEND_API_KEY: string; MAIL_FROM: string; ENVIRONMENT?: string }>;

const RESEND = 'https://api.resend.com/emails';

/**
 * Send a letter through Resend — in production only. Anywhere else this is a
 * no-op: the suite opens requests by the dozen, and every one of them would
 * otherwise write to the real staff. A failed send is swallowed, because the
 * thread is already saved and a mail provider must not be able to undo that.
 */
export const sendTicketMail = async (env: MailEnv, mail: TicketMail): Promise<void> => {
  await Promise.all(
    [mail]
      .filter(() => env.ENVIRONMENT === 'production' && mail.to.length > 0)
      .map((letter) =>
        fetch(RESEND, {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
          body: JSON.stringify({ from: env.MAIL_FROM, to: letter.to, subject: letter.subject, html: letter.html }),
        }).catch(() => undefined),
      ),
  );
};
