import type { APIRoute } from 'astro';
import { deleteRoute, editAnonymousRoute, getRoute, setRoutePrivacy, updateRouteData } from '../../../lib/favorites/favorites-db.ts';

export const prerender = false;

const field = (obj: unknown, key: string): unknown => (Object(obj) === obj ? Reflect.get(Object(obj), key) : undefined);

/** Edit a saved route. An in-place itinerary edit (`data`) is allowed for the
 *  owner OR for anyone holding the link to an anonymous (owner-less) route —
 *  otherwise anonymous routes could never be edited. A privacy change stays
 *  strictly owner-only. */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  const id = params.id ?? '';
  const route = await getRoute(locals.runtime.env.DB, id);
  if (!route) return Response.json({ error: 'not-found' }, { status: 404 });
  const body: unknown = await request.json().catch(() => ({}));
  const data = field(body, 'data');
  if (typeof data === 'string') {
    if (data.length > 40000) return Response.json({ error: 'too-large' }, { status: 400 });
    if (user !== undefined && route.userId === user.id) {
      await updateRouteData(locals.runtime.env.DB, user.id, id, data);
      return Response.json({ id, updated: true });
    }
    if (route.userId === undefined) {
      // Anonymous route: only its author's device holds the edit token.
      const token = request.headers.get('x-route-token') ?? '';
      const ok = token !== '' && (await editAnonymousRoute(locals.runtime.env.DB, id, data, token));
      if (!ok) return Response.json({ error: 'forbidden' }, { status: 403 });
      return Response.json({ id, updated: true });
    }
    return Response.json({ error: 'not-found' }, { status: 404 });
  }
  // Privacy is owner-only.
  if (user === undefined || route.userId !== user.id) return Response.json({ error: 'auth' }, { status: 401 });
  const isPublic = field(body, 'public') === true;
  await setRoutePrivacy(locals.runtime.env.DB, user.id, id, isPublic);
  return Response.json({ id, public: isPublic });
};

/** Owner-only: delete a saved route. */
export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  const id = params.id ?? '';
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  await deleteRoute(locals.runtime.env.DB, user.id, id);
  return Response.json({ id, deleted: true });
};
