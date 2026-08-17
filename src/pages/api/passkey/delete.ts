import type { APIRoute } from 'astro';
import { deleteCredential } from '../../../lib/auth/credentials.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';

export const prerender = false;

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });
const badRequest = () => Response.json({ error: 'bad_request' }, { status: 400 });

/** Remove one of the signed-in user's own passkeys. */
export const POST: APIRoute = ({ request, locals }) =>
  gatedResponse(locals.user)(unauthorized)(async (user) => {
    const body = (await request.json().catch(() => ({}))) as { id?: string };
    return gatedResponse(body.id, (id) => Boolean(id))(badRequest)(async (credentialId) => {
      await deleteCredential(locals.runtime.env.DB, user.id, credentialId);
      return Response.json({ ok: true });
    });
  });
