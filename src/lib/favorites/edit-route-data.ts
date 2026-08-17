import { editAnonymousRoute } from './edit-anonymous-route.ts';
import { isDefined } from '../is-defined.ts';
import { routeEditMode } from './route-edit-mode.ts';
import { updateRouteData } from './update-route-data.ts';
import type { RouteEdit } from './route-edit-types.ts';
import type { RouteEditMode } from './route-edit-mode.ts';

const MAX_DATA = 40000;
const updated = (id: string): Response => Response.json({ id, updated: true });
const forbidden = (): Response => Response.json({ error: 'forbidden' }, { status: 403 });
const notFound = (): Response => Response.json({ error: 'not-found' }, { status: 404 });

const asOwner = async (edit: RouteEdit): Promise<Response> => {
  const owners = [edit.userId].filter(isDefined);
  await Promise.all(owners.map((userId) => updateRouteData(edit.db, userId, edit.id, edit.data)));
  // `routeEditMode` only answers 'owner' for a signed-in owner, so the list is
  // never empty here; an empty one would change nothing and 404, as before.
  return owners.map(() => updated(edit.id)).at(0) ?? notFound();
};

/** Anonymous route: only its author's device holds the edit token, and an
 *  empty token never reaches the statement. */
const asAnonymous = async (edit: RouteEdit): Promise<Response> => {
  const tried = await Promise.all(
    [edit.token]
      .filter((token) => token !== '')
      .map((token) => editAnonymousRoute(edit.db, edit.id, edit.data, token)),
  );
  return tried.filter((changed) => changed).map(() => updated(edit.id)).at(0) ?? forbidden();
};

const MODES: Record<RouteEditMode, (edit: RouteEdit) => Promise<Response>> = {
  owner: asOwner,
  anonymous: asAnonymous,
  forbidden: async () => notFound(),
};

/** Overwrite a route's itinerary, for whoever is allowed to. */
export const editRouteData = async (edit: RouteEdit): Promise<Response> => {
  const tooLarge = [edit.data]
    .filter((data) => data.length > MAX_DATA)
    .map(() => Response.json({ error: 'too-large' }, { status: 400 }))
    .at(0);
  return tooLarge ?? (await MODES[routeEditMode(edit.route, edit.userId)](edit));
};
