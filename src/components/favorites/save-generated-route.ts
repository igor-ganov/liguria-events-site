import { genState } from './gen-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { pickPois } from './pick-pois.ts';
import { postRoute } from './post-route.ts';
import { readFavPois } from '../../lib/favorites/fav-pois.ts';
import { rememberRoute } from './remember-route.ts';
import { routeSaveName } from './route-save-name.ts';
import { savedRouteBody } from './saved-route-body.ts';
import { showShareLink } from './show-share-link.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { SavedRoute } from './as-saved-route.ts';

const tokenOf = (route: SavedRoute): Readonly<{ editToken: string }> | undefined =>
  [route.editToken].filter(isDefined).map((editToken) => ({ editToken })).at(0);

const saveDays = async (days: readonly RouteDay[]): Promise<void> => {
  const name = routeSaveName(days);
  const placed = new Set(days.flatMap((day) => day.stops.map((stop) => stop.id)));
  const data = savedRouteBody({
    mode: genState.mode,
    range: genState.range,
    days,
    durations: genState.durations,
    times: genState.times,
    pauses: genState.pauses,
    pois: pickPois(placed, readFavPois()),
  });
  const saved = await postRoute(name, data);
  saved.forEach((route) => rememberRoute({ id: route.id, name, data, ...tokenOf(route) }));
  showShareLink(saved.at(0)?.url);
};

/** Shell: save the generated route and show its share link. An empty route is
 *  not savable, so nothing happens at all. */
export const saveGeneratedRoute = async (days: readonly RouteDay[]): Promise<void> => {
  await Promise.all([days].filter((list) => list.length > 0).map(saveDays));
};
