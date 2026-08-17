import type { APIRoute } from 'astro';
import { isDefined } from '../../../lib/is-defined.ts';
import { publicUser } from '../../../lib/auth/public-user.ts';

export const prerender = false;

/** Current signed-in user (resolved by middleware), or the empty marker the
 *  client already expects when nobody is signed in. */
export const GET: APIRoute = ({ locals }) =>
  Response.json({
    user: [locals.user].filter(isDefined).map(publicUser).at(0) ?? null,
  });
