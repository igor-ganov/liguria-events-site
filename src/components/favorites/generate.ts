import { asIdLists } from './as-id-lists.ts';
import { asNumberMap } from './as-number-map.ts';
import { asStringMap } from './as-string-map.ts';
import { branch } from '../../lib/branch.ts';
import { buildRoute, poiToStop, routeFromGroups } from '../../lib/favorites/build-route.ts';
import { enrichDays } from '../../lib/favorites/enrich-route.ts';
import { fetchGenCorpus } from './fetch-gen-corpus.ts';
import { GEN_KEYS } from './gen-keys.ts';
import { genRange } from './gen-range.ts';
import { genState } from './gen-state.ts';
import { groupsInOrder } from './groups-in-order.ts';
import { paintRoute } from './paint-route.ts';
import { readFavorites } from './init-favorites.ts';
import { readFavPois } from '../../lib/favorites/fav-pois.ts';
import { readJsonStore } from './read-json-store.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { setHidden } from '../../lib/dom/set-hidden.ts';
import { showSaveButton } from './show-save-button.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';

// Favourited events (from the corpus) + favourited landmarks/places (POIs).
const favouriteStops = async (): Promise<readonly RouteStop[]> => {
  const favourites = readFavorites();
  const pois = Object.values(readFavPois()).filter((poi) => favourites.has(poi.id));
  const events = (await fetchGenCorpus()).filter((event) => favourites.has(event.id));
  return [...events, ...pois.map(poiToStop)];
};

const readArrangement = (): void => {
  genState.durations = asNumberMap(readJsonStore(GEN_KEYS.durations));
  genState.order = asIdLists(readJsonStore(GEN_KEYS.order));
  genState.times = asStringMap(readJsonStore(GEN_KEYS.times));
  genState.pauses = asNumberMap(readJsonStore(GEN_KEYS.pauses));
};

/** Shell: rebuild the route from the current favourites. Paints instantly with
 *  the straight-line estimate, then upgrades to real routing — unless a newer
 *  generation has since superseded this one. */
export const generate = async (): Promise<void> => {
  const mine = (genState.gen += 1);
  const { ui } = readUiIsland();
  readArrangement();
  const stops = await favouriteStops();
  genState.byId = new Map(stops.map((stop) => [stop.id, stop]));
  genState.range = genRange();
  const built = groupsInOrder(buildRoute(stops, genState.mode, genState.range), genState.order);
  genState.days = routeFromGroups(built, genState.mode, genState.byId);
  // A fresh generation invalidates the old share link.
  setHidden(document.querySelector<HTMLElement>('[data-route-share]') ?? undefined, true);
  paintRoute(genState.days);
  showSaveButton(ui.route.save, genState.days.length === 0);
  const enriched = await enrichDays(genState.days, genState.mode);
  branch(mine !== genState.gen)<void>(
    () => undefined,
    () => {
      genState.days = enriched;
      paintRoute(enriched);
    },
  );
};
