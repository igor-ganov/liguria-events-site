import type { APIRoute } from 'astro';
import { bannedDenial } from '../../lib/auth/banned-denial.ts';
import { createRoute } from '../../lib/favorites/create-route.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { listRoutes } from '../../lib/favorites/favorites-db.ts';

export const prerender = false;

/** The signed-in user's saved routes (anonymous callers list from localStorage). */
export const GET: APIRoute = async ({ locals }) => {
  const lists = await Promise.all(
    [locals.user].filter(isDefined).map((user) => listRoutes(locals.runtime.env.DB, user.id)),
  );
  return Response.json({ routes: lists.at(0) ?? [] });
};

/** Create a saved route. Anonymous routes are always public (a shareable unique
 *  link); an owner's route defaults to private unless `public` is set. */
export const POST: APIRoute = async ({ request, locals }) =>
  bannedDenial(locals.user) ??
  (await createRoute(
    locals.runtime.env.DB,
    locals.user?.id,
    await request.json().catch(() => ({})),
  ));
