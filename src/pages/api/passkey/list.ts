import type { APIRoute } from 'astro';
import { listUserPasskeys } from '../../../lib/auth/credentials.ts';

export const prerender = false;

/** The signed-in user's passkeys (for the settings page). */
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const passkeys = await listUserPasskeys(locals.runtime.env.DB, user.id);
  return Response.json({ passkeys });
};
