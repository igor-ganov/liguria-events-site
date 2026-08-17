import { GEN_KEYS } from './gen-keys.ts';
import { nextRememberedRoutes } from './next-remembered-routes.ts';
import { readJsonStore } from './read-json-store.ts';
import { writeJsonStore } from './write-json-store.ts';
import type { RememberedRoute } from './next-remembered-routes.ts';

/** Shell: keep a local copy of a route this device created — including the edit
 *  token, which is what authorises editing an anonymous route later. */
export const rememberRoute = (route: RememberedRoute): void => {
  const previous = readJsonStore(GEN_KEYS.routes);
  writeJsonStore(GEN_KEYS.routes, nextRememberedRoutes(previous, route, Date.now()));
};
