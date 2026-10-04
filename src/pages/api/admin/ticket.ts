import type { APIRoute } from 'astro';
import { decideTicket } from '../../../lib/tickets/decide-ticket.ts';
import { isAdmin } from '../../../lib/admin/is-admin.ts';
import { isDefined } from '../../../lib/is-defined.ts';
import { ticketOf } from '../../../lib/tickets/ticket-of.ts';
import { trimmedString } from '../../../lib/trimmed-string.ts';

export const prerender = false;

const notFound = (): Response => Response.json({ error: 'not found' }, { status: 404 });

/** Admin-only: approve a claim, or close a thread as resolved or rejected.
 *  Anyone who is not a signed-in admin is refused before the form is read. */
export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime.env.DB;
  const answers = await Promise.all(
    [locals.user].filter(isAdmin).map(async (admin) => {
      const form = await request.formData().catch(() => new FormData());
      const ticket = await ticketOf(db, trimmedString(form.get('id'), 40));
      const decided = await Promise.all(
        [ticket].filter(isDefined).map((found) => decideTicket(db, admin, found, trimmedString(form.get('action'), 20))),
      );
      return decided.at(0) ?? notFound();
    }),
  );
  return answers.at(0) ?? Response.json({ error: 'forbidden' }, { status: 403 });
};
