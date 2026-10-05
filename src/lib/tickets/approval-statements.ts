import { addTicketMessage } from './add-ticket-message.ts';
import { adoptEvent } from './adopt-event.ts';
import { adoptionRow } from './adoption-row.ts';
import { dropClaimCode } from './drop-claim-code.ts';
import { grantEventOwner } from './grant-event-owner.ts';
import { setTicketStatus } from './set-ticket-status.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { Ticket } from './ticket-types.ts';

const APPROVED = 'Approved. This event is now yours.';

/**
 * What approving a claim writes, whoever approves it — a member of staff by
 * hand, or the claimant by typing the code the staff sent. The event is handed
 * over, the thread says so and closes, all in one batch: an event handed over
 * with the thread still open, or the reverse, is a state nobody can explain
 * later. `grantedBy` is the member of staff who stands behind the decision.
 */
export const approvalStatements = (db: D1Database, grantedBy: string, ticket: Ticket, now: string, crawled: CompactEvent | undefined): readonly D1PreparedStatement[] => [
  // A crawled event is copied under its organiser so that they can edit it.
  // One that is not in the corpus is either theirs already or gone.
  ...[crawled].filter((event) => event !== undefined).map((event) => adoptEvent(db, adoptionRow(event, ticket.userId, now))),
  grantEventOwner(db, ticket, grantedBy, now),
  addTicketMessage(db, { ticketId: ticket.id, authorId: grantedBy, staff: true, body: APPROVED, attachment: undefined }, now),
  setTicketStatus(db, ticket.id, 'resolved', now),
  dropClaimCode(db, ticket.id),
];
