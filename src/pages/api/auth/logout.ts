import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/auth/session.ts';

export const prerender = false;

/** Clear the session cookie (called via fetch from the header control). Must
 *  match the domain the cookie was set with, or the browser keeps it. */
export const POST: APIRoute = ({ cookies, locals }) => {
  const opts =
    locals.runtime.env.ENVIRONMENT === 'production' ? { path: '/', domain: '.dovego.it' } : { path: '/' };
  cookies.delete(SESSION_COOKIE, opts);
  return Response.json({ ok: true });
};
