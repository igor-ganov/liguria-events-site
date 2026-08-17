import { asLocalRoutes } from './as-local-routes.ts';
import { readJsonStore } from './read-json-store.ts';
import { ROUTES_KEY } from './routes-key.ts';
import type { MyRoute } from './my-route-types.ts';

/** Shell: the route links this device remembers. */
export const localRouteRows = (): readonly MyRoute[] => asLocalRoutes(readJsonStore(ROUTES_KEY));
