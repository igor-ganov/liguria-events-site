import { isDefined } from '../is-defined.ts';
import { ROUTE_SELECT_COLS } from './route-select-cols.ts';
import { toSavedRoute } from './to-saved-route.ts';
import type { RouteRow, SavedRoute } from './saved-route.ts';

/** A single route by id, for viewing (access is checked by the caller). */
export const getRoute = async (db: D1Database, id: string): Promise<SavedRoute | undefined> => {
  const row = await db
    .prepare(`SELECT ${ROUTE_SELECT_COLS} FROM saved_routes WHERE id = ?`)
    .bind(id)
    .first<RouteRow>();
  return [row ?? undefined].filter(isDefined).map(toSavedRoute).at(0);
};
