import { editRouteData } from './edit-route-data.ts';
import { editRoutePrivacy } from './edit-route-privacy.ts';
import { isDefined } from '../is-defined.ts';
import { jsonField } from '../json-field.ts';
import type { SavedRoute } from './saved-route.ts';

/** Edit a saved route: a `data` field is an in-place itinerary edit, anything
 *  else is a privacy change. A body whose `data` is not a string takes the
 *  privacy path, exactly as the `typeof data === 'string'` test did. */
export const patchRoute = async (
  db: D1Database,
  route: SavedRoute,
  id: string,
  request: Request,
  userId?: string,
): Promise<Response> => {
  const body: unknown = await request.json().catch(() => ({}));
  const token = request.headers.get('x-route-token') ?? '';
  const edits = await Promise.all(
    [jsonField(body, 'data')]
      .filter(isDefined)
      .map((data) => editRouteData({ db, route, id, data, userId, token })),
  );
  return edits.at(0) ?? (await editRoutePrivacy(db, route, id, body, userId));
};
