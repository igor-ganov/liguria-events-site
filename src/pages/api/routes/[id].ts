import type { APIRoute } from 'astro';
import { deleteRoute, getRoute } from '../../../lib/favorites/favorites-db.ts';
import { isDefined } from '../../../lib/is-defined.ts';
import { patchRoute } from '../../../lib/favorites/patch-route.ts';

export const prerender = false;

/** Edit a saved route. An in-place itinerary edit (`data`) is allowed for the
 *  owner OR for anyone holding the link to an anonymous (owner-less) route —
 *  otherwise anonymous routes could never be edited. A privacy change stays
 *  strictly owner-only. A route that does not exist 404s before the body is read. */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const id = params.id ?? '';
  const route = await getRoute(locals.runtime.env.DB, id);
  const edits = await Promise.all(
    [route]
      .filter(isDefined)
      .map((found) => patchRoute(locals.runtime.env.DB, found, id, request, locals.user?.id)),
  );
  return edits.at(0) ?? Response.json({ error: 'not-found' }, { status: 404 });
};

/** Owner-only: delete a saved route. */
export const DELETE: APIRoute = async ({ params, locals }) => {
  const id = params.id ?? '';
  const deleted = await Promise.all(
    [locals.user].filter(isDefined).map(async (user) => {
      await deleteRoute(locals.runtime.env.DB, user.id, id);
      return Response.json({ id, deleted: true });
    }),
  );
  return deleted.at(0) ?? Response.json({ error: 'auth' }, { status: 401 });
};
