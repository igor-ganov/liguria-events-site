import { createTicket } from './create-ticket.ts';
import { seeOther } from './see-other.ts';
import { ticketDenial } from './ticket-denial.ts';
import { ticketInput } from './ticket-input.ts';
import { notifyTicket } from './notify-ticket.ts';
import type { AppUser } from '../auth/types.ts';
import type { DeferredWork } from '../deferred-work.ts';
import type { NotifyEnv } from './notify-ticket.ts';
import type { TicketInput } from './ticket-input.ts';
import type { TicketKind } from './ticket-types.ts';

// The kind passed the denial above; this only says so to the type.
const kindOf = (input: TicketInput): TicketKind => [input.kind].filter((kind): kind is TicketKind => kind === 'claim').at(0) ?? 'report';

const opened = async (env: NotifyEnv, ctx: DeferredWork, user: AppUser, input: TicketInput): Promise<Response> => {
  const id = await createTicket(env.DB, user.id, input);
  notifyTicket(env, ctx, { id, kind: kindOf(input), eventTitle: input.title }, 'opened', input.body);
  return seeOther(`/tickets/${id}/`);
};

/** Open a request from the posted form and send the reader to its thread. A
 *  form that cannot be read is treated as an empty one, and refused as such. */
export const openTicket = async (env: NotifyEnv, ctx: DeferredWork, user: AppUser, request: Request): Promise<Response> => {
  const input = ticketInput(await request.formData().catch(() => new FormData()));
  return ticketDenial(input) ?? (await opened(env, ctx, user, input));
};
