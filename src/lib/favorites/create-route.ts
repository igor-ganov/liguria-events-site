import { anonymousEditToken } from './anonymous-edit-token.ts';
import { editTokenPart } from './edit-token-part.ts';
import { jsonValue } from '../json-value.ts';
import { newRouteId } from './new-route-id.ts';
import { routeIsPublic } from './route-is-public.ts';
import { routeRegion } from './route-region.ts';
import { saveRoute } from './save-route.ts';
import { trimmedString } from '../trimmed-string.ts';

const insert = async (
  db: D1Database,
  userId: string | undefined,
  body: unknown,
  data: string,
): Promise<Response> => {
  const id = newRouteId();
  const isPublic = routeIsPublic(userId !== undefined, body);
  const token = editTokenPart(anonymousEditToken(userId !== undefined));
  await saveRoute(
    db,
    {
      id,
      userId,
      name: trimmedString(jsonValue(body, 'name'), 120) || 'Route',
      region: routeRegion(jsonValue(body, 'region')),
      data,
      isPublic,
      ...token,
    },
    Date.now(),
  );
  return Response.json({ id, url: `/route/${id}`, public: isPublic, ...token });
};

/** Create a saved route from a request body; an empty itinerary is refused. */
export const createRoute = async (
  db: D1Database,
  userId: string | undefined,
  body: unknown,
): Promise<Response> => {
  const data = trimmedString(jsonValue(body, 'data'), 40000);
  const created = await Promise.all(
    [data].filter((text) => text !== '').map((text) => insert(db, userId, body, text)),
  );
  return created.at(0) ?? Response.json({ error: 'invalid' }, { status: 400 });
};
