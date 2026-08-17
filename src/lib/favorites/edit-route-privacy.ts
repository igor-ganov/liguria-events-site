import { isDefined } from '../is-defined.ts';
import { jsonValue } from '../json-value.ts';
import { setRoutePrivacy } from './set-route-privacy.ts';
import type { SavedRoute } from './saved-route.ts';

const apply = async (db: D1Database, userId: string, id: string, body: unknown): Promise<Response> => {
  const isPublic = jsonValue(body, 'public') === true;
  await setRoutePrivacy(db, userId, id, isPublic);
  return Response.json({ id, public: isPublic });
};

/** Privacy is owner-only: anyone else — signed out, or not this route's owner
 *  — is refused with the 401 they always got. */
export const editRoutePrivacy = async (
  db: D1Database,
  route: SavedRoute,
  id: string,
  body: unknown,
  userId?: string,
): Promise<Response> => {
  const set = await Promise.all(
    [userId]
      .filter(isDefined)
      .filter((owner) => route.userId === owner)
      .map((owner) => apply(db, owner, id, body)),
  );
  return set.at(0) ?? Response.json({ error: 'auth' }, { status: 401 });
};
