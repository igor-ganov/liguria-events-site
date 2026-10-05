import type { APIRoute } from 'astro';
import { cachedEvents } from '../../../../data/cached-events.ts';
import { enterClaimCode } from '../../../../lib/tickets/enter-claim-code.ts';
import { EVENTS_URL } from '../../../../data/events-url.ts';
import { isActiveMember } from '../../../../lib/auth/is-active-member.ts';
import { isDefined } from '../../../../lib/is-defined.ts';
import { mayEnterCode } from '../../../../lib/tickets/may-enter-code.ts';
import { memberDenial } from '../../../../lib/auth/member-denial.ts';
import { ticketOf } from '../../../../lib/tickets/ticket-of.ts';
import { trimmedString } from '../../../../lib/trimmed-string.ts';

export const prerender = false;

const notFound = (): Response => Response.json({ error: 'not found' }, { status: 404 });

/** The claimant types in the code the staff sent. A thread that is not the
 *  caller's own answers exactly as one that does not exist. */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = locals.runtime.env;
  const answers = await Promise.all(
    [locals.user].filter(isActiveMember).map(async (user) => {
      const ticket = await ticketOf(env.DB, params.id ?? '');
      const own = [ticket].filter(isDefined).filter((found) => mayEnterCode(user, found));
      const form = await request.formData().catch(() => new FormData());
      // The event as the crawler has it today, for the copy an approval makes.
      const corpus = await cachedEvents(EVENTS_URL).catch(() => ({ events: [] }));
      const taken = await Promise.all(
        own.map((found) =>
          enterClaimCode(env, locals.runtime.ctx, found, trimmedString(form.get('code'), 20), corpus.events.find((event) => event.id === found.eventId)),
        ),
      );
      return taken.at(0) ?? notFound();
    }),
  );
  return answers.at(0) ?? memberDenial(locals.user);
};
