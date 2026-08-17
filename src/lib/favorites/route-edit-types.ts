import type { SavedRoute } from './saved-route.ts';

/** Everything an in-place itinerary edit needs: the route it found, the new
 *  payload, who is asking, and the edit token they presented (if any). */
export type RouteEdit = Readonly<{
  db: D1Database;
  route: SavedRoute;
  id: string;
  data: string;
  userId: string | undefined;
  token: string;
}>;
