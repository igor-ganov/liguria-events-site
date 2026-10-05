import { sendTicketMail } from './send-ticket-mail.ts';
import { ticketMail } from './ticket-mail.ts';
import type { DeferredWork } from '../deferred-work.ts';
import type { MailEnv } from './send-ticket-mail.ts';
import type { TicketKind } from './ticket-types.ts';
import type { TicketMove } from './ticket-mail.ts';

export type NotifyEnv = MailEnv & Readonly<{ DB: D1Database; PUBLIC_ORIGIN: string; ADMIN_EMAILS: string }>;
type Subject = Readonly<{ id: string; kind: TicketKind; eventTitle: string }>;

const READER = 'SELECT u.email AS email FROM tickets t JOIN users u ON u.id = t.user_id WHERE t.id = ?';

const admins = (list: string): readonly string[] =>
  list
    .split(',')
    .map((address) => address.trim())
    .filter((address) => address !== '');

const tell = async (env: NotifyEnv, ticket: Subject, moved: TicketMove, words: string): Promise<void> => {
  const reader = (await env.DB.prepare(READER).bind(ticket.id).first<{ email: string }>())?.email ?? '';
  await sendTicketMail(env, ticketMail({ ticket, moved, origin: env.PUBLIC_ORIGIN, admins: admins(env.ADMIN_EMAILS), reader, words }));
};

/**
 * Tell the other side that a thread moved, after the response has gone: the
 * reader is not kept waiting on a mail provider, and nothing that goes wrong
 * here can turn a saved message into an error page.
 */
export const notifyTicket = (env: NotifyEnv, ctx: DeferredWork, ticket: Subject, moved: TicketMove, words: string): void =>
  ctx.waitUntil(tell(env, ticket, moved, words).catch(() => undefined));
