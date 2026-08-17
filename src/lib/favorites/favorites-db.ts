// Per-user favourites and saved routes in D1 (0007 migration). Every statement
// now lives in its own module — one query per file, with the pure row shaping
// (to-saved-route.ts) split out and unit-tested. This file stays the import
// surface the API endpoints and pages already use.
export type { RouteInput, RouteRow, SavedRoute } from './saved-route.ts';
export { addFavorite } from './add-favorite.ts';
export { deleteRoute } from './delete-route.ts';
export { editAnonymousRoute } from './edit-anonymous-route.ts';
export { getRoute } from './get-route.ts';
export { listFavorites } from './list-favorites.ts';
export { listRoutes } from './list-routes.ts';
export { removeFavorite } from './remove-favorite.ts';
export { saveRoute } from './save-route.ts';
export { setRoutePrivacy } from './set-route-privacy.ts';
export { syncFavorites } from './sync-favorites.ts';
export { toSavedRoute } from './to-saved-route.ts';
export { updateRouteData } from './update-route-data.ts';
