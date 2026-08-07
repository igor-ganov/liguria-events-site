import type { APIRoute } from 'astro';
import { addFavorite, listFavorites, removeFavorite, syncFavorites } from '../../lib/favorites/favorites-db.ts';

export const prerender = false;

const isEventId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(v);
const idList = (v: unknown): readonly string[] =>
  Array.isArray(v) ? v.filter(isEventId).slice(0, 500) : [];

/** The signed-in user's favourite event ids (empty for anonymous callers —
 *  they keep favourites in localStorage). */
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ favorites: [] });
  return Response.json({ favorites: await listFavorites(locals.runtime.env.DB, user.id) });
};

/** POST { event } → add one; POST { sync: [ids] } → merge localStorage on
 *  sign-in and return the full merged set. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const db = locals.runtime.env.DB;
  const now = Date.now();
  if (Array.isArray(body.sync)) {
    return Response.json({ favorites: await syncFavorites(db, user.id, idList(body.sync), now) });
  }
  if (!isEventId(body.event)) return Response.json({ error: 'invalid event' }, { status: 400 });
  await addFavorite(db, user.id, body.event, now);
  return Response.json({ ok: true });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (!isEventId(body.event)) return Response.json({ error: 'invalid event' }, { status: 400 });
  await removeFavorite(locals.runtime.env.DB, user.id, body.event);
  return Response.json({ ok: true });
};
