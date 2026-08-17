import { routeInsert } from './route-insert.ts';
import type { RouteInput } from './saved-route.ts';

/** Insert or update a route. `userId` is undefined for an anonymous route,
 *  which is always public; an owned route respects `isPublic`. The statement
 *  itself is chosen by the pure routeInsert — this is only the write. */
export const saveRoute = async (db: D1Database, route: RouteInput, now: number): Promise<void> => {
  const { sql, values } = routeInsert(route, now);
  await db.prepare(sql).bind(...values).run();
};
