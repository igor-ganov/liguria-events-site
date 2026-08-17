import type { FavPoi } from '../../lib/favorites/fav-pois.ts';
import type { Payload } from './route-payload.ts';
import type { PickMode } from './pick-mode.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';
import type { RouteView } from './to-view.ts';

/** Everything the owner-only route editor carries between events. `poiMap` is
 *  the route's embedded POIs plus this device's favourites, so a just-added POI
 *  resolves before the route is saved. `enrichGen` drops a stale async leg fill
 *  when a newer edit has since re-rendered. */
export type EditorState = {
  payload: Payload;
  byId: ReadonlyMap<string, RouteStop>;
  favourites: ReadonlySet<string>;
  poiMap: Readonly<Record<string, FavPoi>>;
  view: RouteView;
  pick: PickMode | undefined;
  enrichGen: number;
};

const EMPTY: Payload = {
  mode: 'walking', groups: [], durations: {}, times: {}, pauses: {}, pois: {},
  dayStart: '', dayEnd: '', dayHours: {}, base: undefined, dayBases: {}, dayFinals: {},
};

// The editor opens on the vertical timeline (drag to move, drag the edge to
// resize); the list view stays a click away for adding favourites, moving
// stops between days and precise duration entry.
export const editorState: EditorState = {
  payload: EMPTY,
  byId: new Map(),
  favourites: new Set(),
  poiMap: {},
  view: 'timeline',
  pick: undefined,
  enrichGen: 0,
};
