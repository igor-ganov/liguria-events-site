import type { TicketKind, TicketStatus } from './ticket-types.ts';

export type TicketAction = 'approve' | 'resolve' | 'reject';

const BY_KIND: Readonly<Record<TicketKind, readonly TicketAction[]>> = {
  claim: ['approve', 'resolve', 'reject'],
  report: ['resolve', 'reject'],
};
const CLOSED: readonly TicketStatus[] = ['resolved', 'rejected'];

/** What an admin may do with a thread. Only a claim can be approved, since
 *  approving hands the event over; a closed thread offers nothing until the
 *  reader writes again. */
export const actionsFor = (ticket: Readonly<{ kind: TicketKind; status: TicketStatus }>): readonly TicketAction[] =>
  [BY_KIND[ticket.kind]].filter(() => !CLOSED.includes(ticket.status)).at(0) ?? [];
