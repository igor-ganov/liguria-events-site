import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/auth/session.ts';

export const prerender = false;

/** Clear the session cookie (called via fetch from the header control). */
export const POST: APIRoute = ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return Response.json({ ok: true });
};
