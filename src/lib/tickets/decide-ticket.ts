import { actionsFor } from './actions-for.ts';
import { addTicketMessage } from './add-ticket-message.ts';
import { grantEventOwner } from './grant-event-owner.ts';
import { seeOther } from './see-other.ts';
import { setTicketStatus } from './set-ticket-status.ts';
import type { AppUser } from '../auth/types.ts';
import type { Ticket } from './ticket-types.ts';
import type { TicketAction } from './actions-for.ts';

const APPROVED = 'Approved. This event is now yours.';

type Statements = Readonly<Record<TicketAction, readonly D1PreparedStatement[]>>;

// What each decision writes. Approving a claim hands the event over, says so in
// the thread and closes it, all in one batch: an event handed over with the
// thread still open, or the reverse, is a state nobody can explain later.
const statements = (db: D1Database, admin: AppUser, ticket: Ticket, now: string): Statements => ({
  approve: [
    grantEventOwner(db, ticket, admin.id, now),
    addTicketMessage(db, { ticketId: ticket.id, authorId: admin.id, staff: true, body: APPROVED, attachment: undefined }, now),
    setTicketStatus(db, ticket.id, 'resolved', now),
  ],
  resolve: [setTicketStatus(db, ticket.id, 'resolved', now)],
  reject: [setTicketStatus(db, ticket.id, 'rejected', now)],
});

const notAllowed = (): Response => Response.json({ error: 'invalid action' }, { status: 400 });

/** Carry out the decision an admin made on a thread, when the thread allows
 *  it: a report cannot be approved, and a closed thread offers nothing. */
export const decideTicket = async (db: D1Database, admin: AppUser, ticket: Ticket, action: string): Promise<Response> => {
  const allowed = actionsFor(ticket).filter((candidate) => candidate === action);
  const done = await Promise.all(
    allowed.map(async (chosen) => {
      await db.batch([...statements(db, admin, ticket, new Date().toISOString())[chosen]]);
      return seeOther(`/tickets/${ticket.id}/`);
    }),
  );
  return done.at(0) ?? notAllowed();
};
