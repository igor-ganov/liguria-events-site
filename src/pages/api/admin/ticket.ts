import type { APIRoute } from 'astro';
import { cachedEvents } from '../../../data/cached-events.ts';
import { decideTicket } from '../../../lib/tickets/decide-ticket.ts';
import { EVENTS_URL } from '../../../data/events-url.ts';
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
      // The event as the crawler has it today, for the copy an approval makes.
      const corpus = await cachedEvents(EVENTS_URL).catch(() => ({ events: [] }));
      const decided = await Promise.all(
        [ticket].filter(isDefined).map((found) =>
          decideTicket(locals.runtime.env, locals.runtime.ctx, admin, found, trimmedString(form.get('action'), 20), corpus.events.find((event) => event.id === found.eventId)),
        ),
      );
      return decided.at(0) ?? notFound();
    }),
  );
  return answers.at(0) ?? Response.json({ error: 'forbidden' }, { status: 403 });
};
