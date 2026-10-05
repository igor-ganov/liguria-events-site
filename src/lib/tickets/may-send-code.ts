import type { ClaimCodeRow } from './claim-code-row.ts';
import type { TicketKind, TicketStatus } from './ticket-types.ts';

const SENDINGS = 3;
const OPEN: readonly TicketStatus[] = ['open', 'answered'];

/** Whether the staff may send a code for a thread: only for a claim, only while
 *  it is open, and three times at most — the mailbox belongs to somebody who
 *  did not ask to hear from us. */
export const maySendCode = (ticket: Readonly<{ kind: TicketKind; status: TicketStatus }>, row: ClaimCodeRow | undefined): boolean =>
  ticket.kind === 'claim' && OPEN.includes(ticket.status) && (row?.sends ?? 0) < SENDINGS;
