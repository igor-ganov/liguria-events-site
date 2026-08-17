import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/auth/session.ts';
import { cookieDomain } from '../../../lib/auth/cookie-domain.ts';

export const prerender = false;

/** Clear the session cookie (called via fetch from the header control). Must
 *  match the domain the cookie was set with, or the browser keeps it. */
export const POST: APIRoute = ({ cookies, locals }) => {
  cookies.delete(SESSION_COOKIE, {
    path: '/',
    ...cookieDomain(locals.runtime.env.ENVIRONMENT === 'production'),
  });
  return Response.json({ ok: true });
};
