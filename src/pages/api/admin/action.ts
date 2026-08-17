import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/admin/is-admin.ts';
import { moderateEvent } from '../../../lib/admin/moderate-event.ts';

export const prerender = false;

/** Admin-only: publish / reject / delete an event, with an audit row. A 0-or-1
 *  actor — anyone who is not a signed-in admin is refused before the body is
 *  even read. */
export const POST: APIRoute = async ({ request, locals }) => {
  const answers = await Promise.all(
    [locals.user].filter(isAdmin).map((actor) => moderateEvent(locals.runtime.env.DB, actor, request)),
  );
  return answers.at(0) ?? Response.json({ error: 'forbidden' }, { status: 403 });
};
