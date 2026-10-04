import type { TicketStatus } from './ticket-types.ts';

const CLOSED: readonly TicketStatus[] = ['resolved', 'rejected'];

/** The state of a thread after a message. Ours makes an open thread answered
 *  and leaves a closed one closed; the reader writing back opens it again,
 *  whatever it was, because somebody is waiting for us once more. */
export const statusAfter = (current: TicketStatus, staff: boolean): TicketStatus =>
  [current].filter(() => staff).map((status) => [status].find((value) => CLOSED.includes(value)) ?? 'answered').at(0) ??
  'open';
