import type { SavedRoute } from './saved-route.ts';

/** Who may edit a route's itinerary in place. */
export type RouteEditMode = 'owner' | 'anonymous' | 'forbidden';

/** An in-place itinerary edit is allowed for the owner OR for anyone holding
 *  the link to an anonymous (owner-less) route — otherwise anonymous routes
 *  could never be edited. The owner is decided first, exactly as before. */
export const routeEditMode = (route: SavedRoute, userId?: string): RouteEditMode =>
  [
    ...[route].filter(() => userId !== undefined && route.userId === userId).map((): RouteEditMode => 'owner'),
    ...[route].filter((r) => r.userId === undefined).map((): RouteEditMode => 'anonymous'),
  ].at(0) ?? 'forbidden';
