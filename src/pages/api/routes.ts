import type { APIRoute } from 'astro';
import { listRoutes, saveRoute } from '../../lib/favorites/favorites-db.ts';
import { REGION_GEO } from '../../lib/region/region-bounds.ts';

export const prerender = false;

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const region = (v: unknown): string => (typeof v === 'string' && v in REGION_GEO ? v : 'liguria');
const newId = (): string => `r${crypto.randomUUID().replace(/-/g, '').slice(0, 11)}`;
// Read a field off a parsed JSON body without an `as` cast: Object(x) === x is
// true only for real objects, so Reflect.get is safe past the guard.
const field = (obj: unknown, key: string): unknown => (Object(obj) === obj ? Reflect.get(Object(obj), key) : undefined);

/** The signed-in user's saved routes (anonymous callers list from localStorage). */
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return Response.json({ routes: [] });
  return Response.json({ routes: await listRoutes(locals.runtime.env.DB, user.id) });
};

/** Create a saved route. Anonymous routes are always public (a shareable unique
 *  link); an owner's route defaults to private unless `public` is set. */
export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (user?.banned) return Response.json({ error: 'banned' }, { status: 403 });
  const body: unknown = await request.json().catch(() => ({}));
  const data = str(field(body, 'data'), 40000);
  if (data === '') return Response.json({ error: 'invalid' }, { status: 400 });
  const id = newId();
  const isPublic = user ? field(body, 'public') === true : true;
  // An anonymous route gets a secret edit token: the creating device keeps it
  // (localStorage) and needs it to edit later — the public link is read-only.
  const editToken = user ? undefined : crypto.randomUUID().replace(/-/g, '');
  await saveRoute(
    locals.runtime.env.DB,
    { id, userId: user?.id, name: str(field(body, 'name'), 120) || 'Route', region: region(field(body, 'region')), data, isPublic, ...(editToken ? { editToken } : {}) },
    Date.now(),
  );
  return Response.json({ id, url: `/route/${id}`, public: isPublic, ...(editToken ? { editToken } : {}) });
};
