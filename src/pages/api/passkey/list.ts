import type { APIRoute } from 'astro';
import { listUserPasskeys } from '../../../lib/auth/credentials.ts';
import { gatedResponse } from '../../../lib/gated-response.ts';

export const prerender = false;

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });

/** The signed-in user's passkeys (for the settings page). */
export const GET: APIRoute = ({ locals }) =>
  gatedResponse(locals.user)(unauthorized)(async (user) =>
    Response.json({ passkeys: await listUserPasskeys(locals.runtime.env.DB, user.id) }),
  );
