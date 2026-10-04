import type { APIRoute } from 'astro';
import { isActiveMember } from '../../../lib/auth/is-active-member.ts';
import { memberDenial } from '../../../lib/auth/member-denial.ts';
import { openTicket } from '../../../lib/tickets/open-ticket.ts';

export const prerender = false;

/** Open a request about an event. A plain form post: the answer is a redirect
 *  to the new thread. A signed-out caller is a 401 and a banned one a 403,
 *  before the form is read. */
export const POST: APIRoute = async ({ request, locals }) => {
  const opened = await Promise.all(
    [locals.user].filter(isActiveMember).map((user) => openTicket(locals.runtime.env.DB, user, request)),
  );
  return opened.at(0) ?? memberDenial(locals.user);
};
