import { addTicketMessage } from './add-ticket-message.ts';
import { claimAddress } from './claim-address.ts';
import { claimCode } from './claim-code.ts';
import { claimCodeMail } from './claim-code-mail.ts';
import { claimCodeOf } from './claim-code-of.ts';
import { maySendCode } from './may-send-code.ts';
import { notifyTicket } from './notify-ticket.ts';
import { saveClaimCode } from './save-claim-code.ts';
import { seeOther } from './see-other.ts';
import { sendTicketMail } from './send-ticket-mail.ts';
import { setTicketStatus } from './set-ticket-status.ts';
import type { AppUser } from '../auth/types.ts';
import type { DeferredWork } from '../deferred-work.ts';
import type { NotifyEnv } from './notify-ticket.ts';
import type { Ticket } from './ticket-types.ts';

export type CodeEnv = NotifyEnv & Readonly<{ SESSION_SECRET: string }>;

const LIFE_MS = 3 * 24 * 60 * 60 * 1000;

const said = (address: string): string =>
  `We sent a six-digit code to ${address}. Whoever reads that mailbox can give it to you: enter it on this page and the event is yours. The code works for three days.`;

const refused = (): Response => Response.json({ error: 'invalid code request' }, { status: 400 });

const letter = async (env: CodeEnv, ticket: Ticket, address: string): Promise<void> => {
  // Read back rather than counted here: the count is raised by the statement
  // that saved it, so two sendings at once cannot agree on one number.
  const sends = (await claimCodeOf(env.DB, ticket.id))?.sends ?? 1;
  const code = await claimCode(env.SESSION_SECRET, ticket.id, address, sends);
  await sendTicketMail(env, claimCodeMail({ address, code, eventTitle: ticket.eventTitle, eventUrl: `${env.PUBLIC_ORIGIN}/event/${ticket.eventId}/` }));
};

/**
 * Send a code for a claim to the address a member of staff chose, and tell the
 * claimant in the thread where it went — never what it is. Refused when the
 * address is not one mailbox or the thread may not have a code (see
 * maySendCode). The record, the message and the new state are one batch.
 */
export const sendClaimCode = async (env: CodeEnv, ctx: DeferredWork, admin: AppUser, ticket: Ticket, typed: unknown): Promise<Response> => {
  const address = claimAddress(typed);
  const allowed = address !== '' && maySendCode(ticket, await claimCodeOf(env.DB, ticket.id));
  const now = new Date();
  const sent = await Promise.all(
    [now.toISOString()].filter(() => allowed).map(async (stamp) => {
      await env.DB.batch([
        saveClaimCode(env.DB, { ticketId: ticket.id, address, sentBy: admin.id, expiresAt: new Date(now.getTime() + LIFE_MS).toISOString() }, stamp),
        addTicketMessage(env.DB, { ticketId: ticket.id, authorId: admin.id, staff: true, body: said(address), attachment: undefined }, stamp),
        setTicketStatus(env.DB, ticket.id, 'answered', stamp),
      ]);
      ctx.waitUntil(letter(env, ticket, address).catch(() => undefined));
      notifyTicket(env, ctx, ticket, 'staff-wrote', said(address));
      return seeOther(`/tickets/${ticket.id}/`);
    }),
  );
  return sent.at(0) ?? refused();
};
