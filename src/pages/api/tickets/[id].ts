import type { APIRoute } from 'astro';
import { isActiveMember } from '../../../lib/auth/is-active-member.ts';
import { isDefined } from '../../../lib/is-defined.ts';
import { mayReadTicket } from '../../../lib/tickets/may-read-ticket.ts';
import { memberDenial } from '../../../lib/auth/member-denial.ts';
import { replyToTicket } from '../../../lib/tickets/reply-to-ticket.ts';
import { ticketOf } from '../../../lib/tickets/ticket-of.ts';

export const prerender = false;

const notFound = (): Response => Response.json({ error: 'not found' }, { status: 404 });

/** Add a message to a thread. A thread the caller may not read answers exactly
 *  as one that does not exist, so its id cannot be probed for. */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = locals.runtime.env;
  const answers = await Promise.all(
    [locals.user].filter(isActiveMember).map(async (user) => {
      const ticket = await ticketOf(env.DB, params.id ?? '');
      const readable = [ticket].filter(isDefined).filter((found) => mayReadTicket(user, found));
      const written = await Promise.all(readable.map((found) => replyToTicket(env, locals.runtime.ctx, user, found, request)));
      return written.at(0) ?? notFound();
    }),
  );
  return answers.at(0) ?? memberDenial(locals.user);
};
