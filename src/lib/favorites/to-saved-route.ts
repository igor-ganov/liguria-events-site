import type { RouteRow, SavedRoute } from './saved-route.ts';

/** Shape a D1 row into a route: the 0/1 flag becomes a boolean and a NULL
 *  owner (an anonymous route) folds to undefined. */
export const toSavedRoute = (row: RouteRow): SavedRoute => ({
  id: row.id,
  name: row.name,
  region: row.region,
  data: row.data,
  public: row.public === 1,
  userId: row.userId ?? undefined,
  createdAt: row.createdAt,
});
