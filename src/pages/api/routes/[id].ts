import type { APIRoute } from 'astro';
import { deleteRoute, getRoute, setRoutePrivacy } from '../../../lib/favorites/favorites-db.ts';

export const prerender = false;

const field = (obj: unknown, key: string): unknown => (Object(obj) === obj ? Reflect.get(Object(obj), key) : undefined);

/** Owner-only: flip a saved route between public and private. */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  const id = params.id ?? '';
  if (!user) return Response.json({ error: 'auth' }, { status: 401 });
  const route = await getRoute(locals.runtime.env.DB, id);
  if (!route || route.userId !== user.id) return Response.json({ error: 'not-found' }, { status: 404 });
  const body: unknown = await request.json().catch(() => ({}));
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
