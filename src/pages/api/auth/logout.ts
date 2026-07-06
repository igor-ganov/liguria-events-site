import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../../lib/auth/session.ts';

export const prerender = false;

/** Clear the session cookie and return home. */
export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return redirect('/');
};
