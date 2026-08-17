import type { APIRoute } from 'astro';
import { addFavorite, listFavorites, removeFavorite, syncFavorites } from '../../lib/favorites/favorites-db.ts';
import { favIdList } from '../../lib/favorites/fav-id-list.ts';
import { gatedResponse } from '../../lib/gated-response.ts';
import { isFavId } from '../../lib/favorites/is-fav-id.ts';
import { jsonValue } from '../../lib/json-value.ts';

export const prerender = false;

const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: 401 });
const invalidEvent = () => Response.json({ error: 'invalid event' }, { status: 400 });
const anonymous = () => Response.json({ favorites: [] });

/** The signed-in user's favourite event ids (empty for anonymous callers —
 *  they keep favourites in localStorage). */
export const GET: APIRoute = ({ locals }) =>
  gatedResponse(locals.user)(anonymous)(async (user) =>
    Response.json({ favorites: await listFavorites(locals.runtime.env.DB, user.id) }),
  );

/** POST { event } → add one; POST { sync: [ids] } → merge localStorage on
 *  sign-in and return the full merged set. */
export const POST: APIRoute = ({ request, locals }) =>
  gatedResponse(locals.user)(unauthorized)(async (user) => {
    const body = await request.json().catch(() => ({}));
    const db = locals.runtime.env.DB;
    const now = Date.now();
    const sync = jsonValue(body, 'sync');
    const isSync = Array.isArray(sync);
    const merged = await Promise.all(
      [sync]
        .filter(() => isSync)
        .map(async () => Response.json({ favorites: await syncFavorites(db, user.id, favIdList(sync), now) })),
    );
    const added = await Promise.all(
      [jsonValue(body, 'event')]
        .filter(() => !isSync)
        .filter(isFavId)
        .map(async (id) => {
          await addFavorite(db, user.id, id, now);
          return Response.json({ ok: true });
        }),
    );
    return merged.at(0) ?? added.at(0) ?? invalidEvent();
  });

export const DELETE: APIRoute = ({ request, locals }) =>
  gatedResponse(locals.user)(unauthorized)(async (user) => {
    const body = await request.json().catch(() => ({}));
    const removed = await Promise.all(
      [jsonValue(body, 'event')].filter(isFavId).map(async (id) => {
        await removeFavorite(locals.runtime.env.DB, user.id, id);
        return Response.json({ ok: true });
      }),
    );
    return removed.at(0) ?? invalidEvent();
  });
