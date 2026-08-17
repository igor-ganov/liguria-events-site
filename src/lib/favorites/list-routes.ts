import { ROUTE_SELECT_COLS } from './route-select-cols.ts';
import { toSavedRoute } from './to-saved-route.ts';
import type { RouteRow, SavedRoute } from './saved-route.ts';

/** A signed-in user's own saved routes, newest first. */
export const listRoutes = async (
  db: D1Database,
  userId: string,
): Promise<readonly SavedRoute[]> => {
  const res = await db
    .prepare(`SELECT ${ROUTE_SELECT_COLS} FROM saved_routes WHERE user_id = ? ORDER BY created_at DESC`)
    .bind(userId)
    .all<RouteRow>();
  return (res.results ?? []).map(toSavedRoute);
};
