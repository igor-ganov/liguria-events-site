import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/admin/is-admin.ts';
import { isDefined } from '../../../lib/is-defined.ts';
import { sendClaimCode } from '../../../lib/tickets/send-claim-code.ts';
import { ticketOf } from '../../../lib/tickets/ticket-of.ts';
import { trimmedString } from '../../../lib/trimmed-string.ts';

export const prerender = false;

const notFound = (): Response => Response.json({ error: 'not found' }, { status: 404 });

/** Admin-only: send a code for a claim to the organiser's own address. Anyone
 *  who is not a signed-in admin is refused before the form is read. */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const answers = await Promise.all(
    [locals.user].filter(isAdmin).map(async (admin) => {
      const form = await request.formData().catch(() => new FormData());
      const ticket = await ticketOf(env.DB, trimmedString(form.get('id'), 40));
      const sent = await Promise.all([ticket].filter(isDefined).map((found) => sendClaimCode(env, locals.runtime.ctx, admin, found, form.get('address'))));
      return sent.at(0) ?? notFound();
    }),
  );
  return answers.at(0) ?? Response.json({ error: 'forbidden' }, { status: 403 });
};
