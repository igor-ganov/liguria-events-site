import { actionsFor } from './actions-for.ts';
import { approvalStatements } from './approval-statements.ts';
import { dropClaimCode } from './drop-claim-code.ts';
import { seeOther } from './see-other.ts';
import { setTicketStatus } from './set-ticket-status.ts';
import { notifyTicket } from './notify-ticket.ts';
import type { AppUser } from '../auth/types.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { DeferredWork } from '../deferred-work.ts';
import type { NotifyEnv } from './notify-ticket.ts';
import type { Ticket } from './ticket-types.ts';
import type { TicketAction } from './actions-for.ts';

type Statements = Readonly<Record<TicketAction, readonly D1PreparedStatement[]>>;

// What each decision writes. Whatever is decided, a code that was waiting for
// the thread dies with the decision: a claim turned down by hand must not be
// approvable by a letter that is still in somebody's mailbox.
const statements = (db: D1Database, admin: AppUser, ticket: Ticket, now: string, crawled: CompactEvent | undefined): Statements => ({
  approve: approvalStatements(db, admin.id, ticket, now, crawled),
  resolve: [setTicketStatus(db, ticket.id, 'resolved', now), dropClaimCode(db, ticket.id)],
  reject: [setTicketStatus(db, ticket.id, 'rejected', now), dropClaimCode(db, ticket.id)],
});

const notAllowed = (): Response => Response.json({ error: 'invalid action' }, { status: 400 });

/** Carry out the decision an admin made on a thread, when the thread allows
 *  it: a report cannot be approved, and a closed thread offers nothing. */
export const decideTicket = async (env: NotifyEnv, ctx: DeferredWork, admin: AppUser, ticket: Ticket, action: string, crawled?: CompactEvent): Promise<Response> => {
  const db = env.DB;
  const allowed = actionsFor(ticket).filter((candidate) => candidate === action);
  const done = await Promise.all(
    allowed.map(async (chosen) => {
      await db.batch([...statements(db, admin, ticket, new Date().toISOString(), crawled)[chosen]]);
      notifyTicket(env, ctx, ticket, 'decided', `Decision: ${chosen}.`);
      return seeOther(`/tickets/${ticket.id}/`);
    }),
  );
  return done.at(0) ?? notAllowed();
};
