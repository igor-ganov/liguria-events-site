import type { APIRoute } from 'astro';
import { deleteCredential } from '../../../lib/auth/credentials.ts';

export const prerender = false;

/** Remove one of the signed-in user's own passkeys. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return Response.json({ error: 'bad_request' }, { status: 400 });
  await deleteCredential(locals.runtime.env.DB, user.id, body.id);
  return Response.json({ ok: true });
};
