import { createTicket } from './create-ticket.ts';
import { seeOther } from './see-other.ts';
import { ticketDenial } from './ticket-denial.ts';
import { ticketInput } from './ticket-input.ts';
import type { AppUser } from '../auth/types.ts';

/** Open a request from the posted form and send the reader to its thread. A
 *  form that cannot be read is treated as an empty one, and refused as such. */
export const openTicket = async (db: D1Database, user: AppUser, request: Request): Promise<Response> => {
  const input = ticketInput(await request.formData().catch(() => new FormData()));
  return ticketDenial(input) ?? seeOther(`/tickets/${await createTicket(db, user.id, input)}/`);
};
