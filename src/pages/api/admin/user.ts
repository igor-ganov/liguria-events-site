import type { APIRoute } from 'astro';
import { isActiveAdmin } from '../../../lib/admin/is-active-admin.ts';
import { moderateUser } from '../../../lib/admin/moderate-user.ts';

export const prerender = false;

/** Admin-only: grant/revoke admin, ban/unban a person, purge their events.
 *  A 0-or-1 actor: anyone who is not a signed-in, unbanned admin is refused
 *  before the body is even read. */
export const POST: APIRoute = async ({ request, locals }) => {
  const answers = await Promise.all(
    [locals.user].filter(isActiveAdmin).map((actor) => moderateUser(locals.runtime.env, actor, request)),
  );
  return answers.at(0) ?? Response.json({ error: 'forbidden' }, { status: 403 });
};
