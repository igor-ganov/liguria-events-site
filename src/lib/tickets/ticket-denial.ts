import { TICKET_KINDS } from './ticket-types.ts';
import type { TicketInput } from './ticket-input.ts';

const EVENT_ID = /^[0-9a-f]{12}$/;
const KINDS: readonly string[] = TICKET_KINDS;

const refuse = (what: string) => (): Response => Response.json({ error: `invalid ${what}` }, { status: 400 });

/** Why a request is refused, in the order the guards run: what kind it is,
 *  which event it is about, then whether it says anything. Undefined means it
 *  may be opened. */
export const ticketDenial = (input: TicketInput): Response | undefined =>
  [
    ...[input].filter((ticket) => !KINDS.includes(ticket.kind)).map(refuse('kind')),
    ...[input].filter((ticket) => !EVENT_ID.test(ticket.event)).map(refuse('event')),
    ...[input].filter((ticket) => ticket.body === '').map(refuse('body')),
  ].at(0);
